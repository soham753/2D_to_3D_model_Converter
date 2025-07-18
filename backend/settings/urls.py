from django.urls import path
from . import views 

urlpatterns = [
   path('profile_photo_update/', views.UpdateProfilePhoto, name='update-profile-photo'),
    path('username_update/', views.UpdateUserName, name='update-username'),
    path('password_update/', views.UpdatePassword, name='update-password'),
]
