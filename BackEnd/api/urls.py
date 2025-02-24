from django.urls import path
from .views import upload_json_file, get_profile_mappings, create_user_profile, check_email, personalized_Algorithm_Data, personalized_creator_recommendation, add_creator, get_single_data

urlpatterns = [
        path('upload-json/', upload_json_file, name='upload_json_file_no_email'),  # No email/Not logged in path
        path('upload-json/<str:email>/', upload_json_file, name='upload_json_file'),  # With email/logged in  path
        path('profile-mapping/', get_profile_mappings, name='get_profile_mappings'),
        path('create-user-profile/', create_user_profile, name='create_user_profile'),
        path('check-email/', check_email, name='check_email'), #! Very bad naming, this checks email AND returns user data
        path('add-creator/', add_creator, name='add_creator'),
        path('personalized-algorithm-data/', personalized_Algorithm_Data, name='personalized_algorithm_Data'),
        path('personalized-creator-recommendation/', personalized_creator_recommendation, name='personalized_creator_recommendation'),
        path('get-single-data/<str:email>/', get_single_data, name='get_single_data')
]
