import cloudinary.uploader
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import Design
import os
import cv2
import numpy as np
import requests
import trimesh
import tempfile
from django.conf import settings
import json

@csrf_exempt
def upload_design(request):
    if request.method == "POST":
        user_id = request.POST.get("user_id")
        file = request.FILES.get("design")  # Handling a single file instead of a list

        if not user_id:
            return JsonResponse({"error": "Missing user_id"}, status=400)

        if not file:
            return JsonResponse({"error": "No file uploaded"}, status=400)

        try:
            # Uploading the image to Cloudinary
            result = cloudinary.uploader.upload(
                file,
                folder="design_uploads"  # Custom Cloudinary folder
            )
            image_url = result['secure_url']
            
            # Saving the image URL and user_id in the database
            design = Design(user_id=user_id, image_url=image_url)
            design.save()

            # Returning a JSON response with success and the uploaded image URL
            return JsonResponse({
                "message": "Upload successful",
                "uploaded_image": image_url  # Return the single uploaded image URL
            })

        except Exception as e:
            return JsonResponse({"error": f"Error uploading file: {str(e)}"}, status=500)

    # Return an error for invalid requests
    return JsonResponse({"error": "Invalid request"}, status=400)


# @csrf_exempt  # Disable CSRF protection for this view
# def process_design(request):
#     if request.method == 'POST':
#         # Parse JSON data from the request body
#         data = json.loads(request.body)
#         user_id = data.get('user_id')
#         image_url = data.get('image_urls')

#         # Check if required fields are provided
#         if not user_id or not image_url:
#             return JsonResponse({"error": "Missing user_id or image_urls"}, status=400)

#         # Example: Process the image (this is just a placeholder)
#         print(f"Processing image for user {user_id} with image URL: {image_url}")

#         # Simulating successful processing
#         return JsonResponse({"success": True, "message": "Processing complete"})

#     return JsonResponse({"error": "Invalid request method"}, status=400)



@csrf_exempt
def process_design(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')
            image_url = data.get('image_urls')

            if not user_id or not image_url:
                return JsonResponse({"error": "Missing user_id or image_urls"}, status=400)

            # Download image
            response = requests.get(image_url)
            if response.status_code != 200:
                return JsonResponse({"error": "Failed to download image from URL"}, status=400)

            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_img:
                temp_img.write(response.content)
                temp_img_path = temp_img.name

            img = cv2.imread(temp_img_path)
            if img is None:
                return JsonResponse({"error": "Failed to read image file"}, status=400)

            border_size = 50
            img = cv2.copyMakeBorder(img, border_size, border_size, border_size, border_size,
                                     cv2.BORDER_CONSTANT, value=[255, 255, 255])
            
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            edges = cv2.Canny(gray, 50, 150)
            lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=100,
                                    minLineLength=50, maxLineGap=10)

            walls = []
            wall_thickness = 0.2
            if lines is not None:
                for line in lines:
                    x1, y1, x2, y2 = line[0]
                    length = np.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
                    if length > 20:
                        walls.append({
                            'start': ((x1 - border_size) / 100.0, (y1 - border_size) / 100.0),
                            'end': ((x2 - border_size) / 100.0, (y2 - border_size) / 100.0),
                            'height': 2.5
                        })

            all_vertices = []
            all_faces = []
            wall_colors = []
            floor_colors = []
            vertex_index = 0
            wall_color = [0.0, 0.0, 255.0, 1.0]

            for wall in walls:
                x1, z1 = wall['start']
                x2, z2 = wall['end']
                h = wall['height']

                dx, dz = x2 - x1, z2 - z1
                length = np.hypot(dx, dz)

                if length > 0:
                    perp_dx = -dz / length * wall_thickness / 2
                    perp_dz = dx / length * wall_thickness / 2

                    v = np.array([
                        [x1 + perp_dx, 0, z1 + perp_dz],
                        [x2 + perp_dx, 0, z2 + perp_dz],
                        [x2 + perp_dx, h, z2 + perp_dz],
                        [x1 + perp_dx, h, z1 + perp_dz],
                        [x1 - perp_dx, 0, z1 - perp_dz],
                        [x2 - perp_dx, 0, z2 - perp_dz],
                        [x2 - perp_dx, h, z2 - perp_dz],
                        [x1 - perp_dx, h, z1 - perp_dz],
                    ])
                    f = np.array([
                        [0, 1, 2], [2, 3, 0],
                        [4, 7, 6], [6, 5, 4],
                        [3, 2, 6], [6, 7, 3],
                        [0, 4, 5], [5, 1, 0],
                        [0, 3, 7], [7, 4, 0],
                        [1, 5, 6], [6, 2, 1]
                    ]) + vertex_index

                    all_vertices.append(v)
                    all_faces.append(f)
                    wall_colors.extend([wall_color] * 12)
                    vertex_index += 8

            if walls:
                xs = [p for wall in walls for p in (wall['start'][0], wall['end'][0])]
                zs = [p for wall in walls for p in (wall['start'][1], wall['end'][1])]
                min_x, max_x = min(xs), max(xs)
                min_z, max_z = min(zs), max(zs)

                padding = 1.0
                floor_vertices = np.array([
                    [min_x - padding, 0, min_z - padding],
                    [max_x + padding, 0, min_z - padding],
                    [max_x + padding, 0, max_z + padding],
                    [min_x - padding, 0, max_z + padding]
                ])
                floor_faces = np.array([
                    [0, 1, 2],
                    [2, 3, 0]
                ]) + vertex_index

                all_vertices.append(floor_vertices)
                all_faces.append(floor_faces)
                floor_color = [0.8, 0.8, 0.8, 1.0]
                floor_colors.extend([floor_color] * 2)

            if all_vertices and all_faces:
                vertices = np.vstack(all_vertices)
                faces = np.vstack(all_faces)
                colors = np.array(wall_colors + floor_colors)

                mesh = trimesh.Trimesh(vertices=vertices, faces=faces, vertex_colors=colors)

                # Save model to temporary file
                with tempfile.NamedTemporaryFile(delete=False, suffix='.ply') as tmp_model:
                    mesh.export(tmp_model.name)
                    tmp_model_path = tmp_model.name

                # Upload to Cloudinary
                upload_result = cloudinary.uploader.upload_large(
                    tmp_model_path,
                    resource_type="raw",
                    folder="3d_models",
                    public_id=f"model_user_{user_id}"
                )

                os.remove(temp_img_path)
                os.remove(tmp_model_path)

                download_url = upload_result.get("secure_url")

                return JsonResponse({
                    "success": True,
                    "message": "3D model generated and uploaded successfully.",
                    "model_url": download_url
                })

            return JsonResponse({"error": "No walls detected in image."}, status=400)

        except Exception as e:
            return JsonResponse({"error": f"Processing error: {str(e)}"}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=400)


