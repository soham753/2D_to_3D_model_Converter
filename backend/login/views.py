from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from register.models import User  

@csrf_exempt
def login_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')

            user = User.objects(email=email, password=password).first()
            if user:
                return JsonResponse({
                    'success': True,
                    'message': 'Login successful',
                    'userId': str(user.id),
                    'name': user.name,
                    'profileImage': user.profile_image if user.profile_image else None  
                }, status=200)
            else:
                return JsonResponse({'success': False, 'message': 'Invalid credentials'}, status=401)

        except Exception as e:
            print("Error in login_user:", e)
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

    return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=405)
