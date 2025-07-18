from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import cloudinary.uploader
from register.models import User
import json
import os


@csrf_exempt  # Only use this if you're not using CSRF tokens in frontend
def UpdateProfilePhoto(request):
    if request.method == "POST":
        profile_photo = request.FILES.get("profilePhoto")
        if not profile_photo:
            return JsonResponse({"success": False, "message": "No profile photo provided"}, status=400)

        user_id = request.POST.get("userId")
        if not user_id:
            return JsonResponse({"success": False, "message": "No user ID provided"}, status=400)

        try:
            user = User.objects.get(id=user_id)

            if user.profile_image:
                old_url = user.profile_image
                # Extract public_id from URL
                public_id = old_url.split("/")[-1].split(".")[0]
                cloudinary.uploader.destroy(f"user_profile_photos/user_{user_id}_profile")

            # Upload new profile image
            upload_result = cloudinary.uploader.upload(
                profile_photo,
                folder="user_profile_photos",
                public_id=f"user_{user_id}_profile",
                overwrite=True,
                resource_type="image"
            )

            image_url = upload_result.get("secure_url")

            # Save new image URL
            user.profile_image = image_url
            user.save()

            return JsonResponse({
                "success": True,
                "message": "Image successfully updated",
                "image_url": image_url
            })

        except User.DoesNotExist:
            return JsonResponse({"success": False, "message": "User not found"}, status=404)

        except Exception as e:
            return JsonResponse({"success": False, "message": f"Error: {str(e)}"}, status=500)

    return JsonResponse({"success": False, "message": "Invalid request method"}, status=405)


@csrf_exempt
def UpdateUserName(request):
    if request.method == 'PUT':  # Update the method to PUT
        data = json.loads(request.body)
        user_id = data.get('userId')  # Ensure you use the correct key name as per your React code
        new_name = data.get('newName')

        if not new_name:
            return JsonResponse({"error": "No name provided"}, status=400)
        
        try:
            # Get user from the user_id provided
            user = User.objects.get(id=user_id)  # Ensure this is the correct field for user_id in MongoDB
            
            # Update the user's name
            user.name = new_name
            user.save()

            return JsonResponse({"success": True, "message": "Name changed successfully."})
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)
        


@csrf_exempt  # Now the view will handle POST requests
def UpdatePassword(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        user_id = data.get('userId')
        old_password = data.get('oldPassword')
        new_password = data.get('newPassword')

        if not old_password or not new_password:
            return JsonResponse({"error": "Password fields are missing"}, status=400)

        try:
            user = User.objects.get(id=user_id)

            # Check if the old password is correct (plain text)
            if old_password == user.password:
                user.password = new_password  # Store the new password as plain text
                user.save()

                return JsonResponse({"success": True, "message": "Password updated successfully"})
            else:
                return JsonResponse({"error": "Incorrect old password"}, status=400)

        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)

    return JsonResponse({"error": "Method Not Allowed"}, status=405)