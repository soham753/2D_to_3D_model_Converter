# register/views.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import User  # MongoEngine User model
from mongoengine.errors import NotUniqueError, ValidationError

@csrf_exempt
def register_user(request):
    if request.method == 'POST':
        try:
            # Ensure request body is not empty
            if not request.body:
                return JsonResponse({'error': 'Empty request body'}, status=400)

            try:
                data = json.loads(request.body)
            except json.JSONDecodeError:
                return JsonResponse({'error': 'Invalid JSON format'}, status=400)

            name = data.get('name')
            email = data.get('email')
            password = data.get('password')

            # Basic field validation
            if not all([name, email, password]):
                return JsonResponse({'error': 'Name, email, and password are required'}, status=400)

            # Create and save the user
            user = User(name=name, email=email, password=password)
            user.save()

            return JsonResponse({'message': 'User registered successfully'}, status=201)

        except NotUniqueError:
            return JsonResponse({'error': 'Email already exists'}, status=400)
        except ValidationError as ve:
            return JsonResponse({'error': f'Validation error: {ve}'}, status=400)
        except Exception as e:
            print("Unexpected error in register_user:", e)
            return JsonResponse({'error': 'Internal server error'}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)
