from django.urls import path
from . import views 


urlpatterns = [
    path('upload_design/',views.upload_design),  # This points to /api/home/ and calls the home_view function in views.py
    path('process/',views.process_design), 
]
