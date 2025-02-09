import re
from django.http import JsonResponse
from rest_framework.decorators import api_view, parser_classes
from django.http import QueryDict
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, JSONParser
from .serializers import UserProfileSerializer
from SupaBaseClient import supabase
import bcrypt
import bcrypt
import json
from django.shortcuts import render
from django.core.mail import send_mail
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os

def index_view(request):
    return render(request, "index.html")

@api_view(['POST'])
def check_email(request):
    """API to check if an email exists in the database and return user details."""
    email = request.data.get('email')
    password = request.data.get('password')
    if not email or not password:
        return Response({"error": "Email and password are required."}, status=400)
    password = request.data.get('password')
    if not email or not password:
        return Response({"error": "Email and password are required."}, status=400)

    try:
        # Query the database for the email
        response = supabase.table("user_profile").select("*").eq("email", email).execute()
        if response.data:
            user = response.data[0]
            stored_password = user.get("password")
            if bcrypt.checkpw(password.encode('utf-8'), stored_password.encode('utf-8')):

                return Response({
                    "message": "Email exists.",
                    "email": user.get("email"),
                    "first_name": user.get("first_name"),
                    "last_name": user.get("last_name"),
                    "password": user.get("password"),  # Include the stored password
                    "json_file": user.get("json_file"),  # Include the JSON file
                }, status=200)
            else:
                return Response({"error": "Incorrect password."}, status=401)
        else:
            return Response({"error": "Email not found."}, status=404)
    except Exception as e:
        return Response({"error": f"An error occurred: {str(e)}"}, status=500)

@api_view(['POST'])
@parser_classes([MultiPartParser])  # Enable file upload and parsing
def upload_json_file(request, email=None):  # Make email parameter optional
    """
        API to handle JSON file upload.
        If the user is logged in, the JSON file is associated with the user's email in the database.
        If the user is not logged in, the JSON file is processed but not associated with any user.
        If the user is logged in The JSON file is stored in S3 and the S3 path is stored in the database.

    """
    user_email = email  # Get email from URL parameter
    uploaded_file = request.FILES.get('file', None)

    if not uploaded_file:
        return Response({"error": "No file provided."}, status=400)

    print("AIAIAIAIAAI")

    try:
        # Read and parse the uploaded JSON file
        file_data = uploaded_file.read().decode('utf-8')
        json_data = json.loads(file_data)
        
        # Extract "following" list from the JSON (if present)
        profile = json_data.get("Profile", {})
        following_list = profile.get("Following List", {}).get("Following", [])

        if not following_list:
            # Dealing with different JSON file formats
            profile = json_data.get("Activity", {})
            following_list = profile.get("Following List", [])

        if not following_list:
            return Response({"error": "No 'Following' found in the JSON file."}, status=400)

        # If user_email is provided, handle file storage, database update
        if user_email:
            response = supabase.table("user_profile").select("*").eq("email", user_email).execute()
            if not response.data:
                return Response({"error": "User not found."}, status=404)

            try:
                # Create the S3 path for the user's JSON file
                s3_path = f'Users/{user_email}/TikTokData/tiktok-data.json'

                # Update the user's database entry with the JSON file
                update_response = supabase.table("user_profile").update({
                    "json_file": json_data,
                    "s3_json_path": s3_path  # Store the S3 path in the database
                }).eq("email", user_email).execute()

                if not update_response.data:
                    return Response({"error": "Failed to update the database entry for the user."}, status=500)

                return Response({
                    "message": "JSON file successfully processed and associated with the user.",
                    "following": following_list,
                    "s3_path": s3_path
                }, status=200)
            except Exception as e:
                return Response({
                    "error": f"Failed to process file: {str(e)}",
                }, status=500)

        # If no email is provided, just process the file without saving
        return Response({
            "message": "JSON file successfully processed but not stored (no user email provided).",
            "following": following_list
        }, status=200)
    except json.JSONDecodeError:
        return Response({"error": "Invalid JSON file."}, status=400)
    except Exception as e:
        return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=500)


#API to create a new user profile in the database.
@api_view(['POST'])
def create_user_profile(request):
    """
    API to create a new user profile in the Supabase database.
    """
    # Extract data from the request
    email = request.data.get("email")
    password = request.data.get("password")
    first_name = request.data.get("first_name")
    last_name = request.data.get("last_name")
    json_file = request.data.get("json_file", {})  # Optional field

    if not email or not password or not first_name or not last_name:
        return Response({"error": "Missing required fields."}, status=400)

    try:
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        hashed_password = hashed_password.decode('utf-8')
        response = supabase.table("user_profile").insert({
            "email": email,
            "password": hashed_password,
            "first_name": first_name,
            "last_name": last_name,
            "json_file": json_file,
        }).execute()

        # if response.data:  # If user was created successfully
        #     # Send welcome email
        #     try:
        #         send_mail(
        #             subject='Welcome to Social Media Manager!',
        #             message=f'Hi {first_name},\n\nWelcome to Social Media Manager! Your account has been created successfully.',
        #             from_email=settings.DEFAULT_FROM_EMAIL,
        #             recipient_list=[email],
        #             fail_silently=True,
        #         )
        #     except Exception as e:
        #         print(f"Failed to send welcome email: {str(e)}")
        #         # Continue even if email fails - don't block user registration
            
        #     return Response({"message": "User profile created successfully!"}, status=201)
            
    except Exception as e:
        return Response({"error": f"Failed to create user profile: {str(e)}"}, status=500)



@api_view(['POST'])
def get_profile_mappings(request):
    """
    API to fetch profiles with social media URLs based on usernames.
    """
    usernames = request.data.get("prof", [])

    if not usernames or not isinstance(usernames, list):
        return Response({"error": "Invalid or missing 'usernames' list."}, status=400)

    try:
        response = (
            supabase.table("socials_mapping")
            .select("*")
            .in_("tiktok_username", usernames)  # Filters rows where tiktok_username matches any value in the list
            .execute()
        )
    except Exception as e:
        return Response({"error": str(e)}, status=500)

    if not response or not response.data:
        return Response({"profiles": []}, status=200)  # Return an empty list if no profiles are found

    mapping_arr = response.data
    if not mapping_arr or not isinstance(mapping_arr, list):
        return Response({"profiles": []}, status=200)  # Return an empty list if the data is invalid

    result = []
    for profile in mapping_arr:
        try:
            result.append({
                "UserName": profile["tiktok_username"],
                "profile_picture": profile.get("profile_picture_url", ""),
                "instagram_url": profile.get("instagram_username", ""),
                "facebook_url": profile.get("facebook_username", ""),
                "twitter_url": profile.get("x_username", ""),
                "reddit_url": profile.get("reddit_username", ""),
            })
        except KeyError as e:
            # Skip profiles with missing required keys
            continue

    return Response({"profiles": result}, status=200)


@api_view(['POST'])
def creator_data(request):
    """
    API to store temporary creator data before manual check.
    """
    # Extract data from the request

    profile_picture = request.data.get("profilePicture")
    tiktok_username = request.data.get("tiktokUsername")
    instagram_username = request.data.get("instagramURL")
    x_username = request.data.get("xURL")
    faceboook_username = request.data.get("facebookURL")
    token = request.data.get("token")

    if not tiktok_username:
        return Response({"error": "Missing TikTok Username!"}, status=400)

    try:
        supabase.table("temporary_creators").insert({
             "profile_picture": profile_picture,
             "tiktok_username": tiktok_username,
             "instagram_username": instagram_username,
             "x_username": x_username,
             "facebook_username": faceboook_username,
             "token": token,
         }).execute()

        return Response({"message": "Social media data stored!"}, status=201)
    except Exception as e:
        return Response({"error": f"Failed to store social media data: {str(e)}"}, status=500)

@api_view(['POST'])
@parser_classes([MultiPartParser])  # Enable file upload and parsing
def personalized_Algorithm_Data(request):
    """API to handle JSON file upload and access the liked/bookmarked videos to generate creator recomendation."""
    # Get the user's email from the request (optional)
    print("ENTERED")
    uploaded_file = request.FILES.get('file', None)
    if not uploaded_file:
        return Response({"error": " file provided."}, status=400)

    try:
        # Read and parse the uploaded JSON file
        file_data = uploaded_file.read().decode('utf-8')
        json_data = json.loads(file_data)

        # Extract "following" list from the JSON (if present)
        profile = json_data.get("Activity", {})

        if not profile:
            return Response({
            "message": "No profile data."
        }, status=200)

        likes = profile.get("Like List", []).get("ItemFavoriteList", [])
        bookmarks = profile.get("Favorite Videos", []).get("FavoriteVideoList", [])

        d = {"Likes": likes, "Bookmarks": bookmarks}

        return Response({
            "message": "Bookmarks/Likes extracted",
            "dict": d
        }, status=200)

    except json.JSONDecodeError:
        return Response({"error": "Invalid JSON file."}, status=400)
    except Exception as e:
        return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=500)
    
@api_view(['POST'])
def personalized_creator_recommendation(request):
    """
    API to generate personalized creator recommendations based on liked and bookmarked videos.
    """
    likes, bookmarks = [], []

    try:
        # Extract the raw QueryDict from request.data
        raw_data = request.data  # This is typically already a dict-like object in DRF
        
        # Convert QueryDict to a regular dictionary
        if isinstance(raw_data, QueryDict):
            data = dict(raw_data.lists())  # To preserve multiple values per key
        else:
            data = raw_data  # It's already a regular dictionary if not a QueryDict

        # Now access the Likes and Bookmarks
        likes = data.get("Likes", [])
        bookmarks = data.get("Bookmarks", [])

        if not likes and not bookmarks:
            return Response({"error": "No data provided for Likes or Bookmarks."}, status=400)

    except json.JSONDecodeError:
        return Response({"error": "Invalid JSON payload."}, status=400)
    except Exception as e:
        return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=500)

    def extract_uid(url):
        match = re.search(r'/video/(\d+)', url)
        return match.group(1) if match else None

    print("EXTRACTED")

    try:
        # Create a dictionary to store scores for each creator
        creator_scores = {}
        print("BABABABAB")
        def calculate_score(likes_count, comments_count, weight=1):
            """
            Calculate a score modifier based on likes and comments.
            Apply a weight for likes/bookmarks.
            """
            scaling_factor = 1 + (likes_count / 1_000_000) + (comments_count / 100_000)
            return weight / scaling_factor
        
        # Process liked videos
        for video in likes:
            video_url = video.get("link")
            like_uid = extract_uid(video_url)
            print("VIDEOURL", video_url)
            if not video_url or not like_uid:
                continue

            # Query the database for this video's data
            response = supabase.table("tiktok_video_data").select(
                "creator_handle, likes_count, comments_count"
            ).like("tiktok_url", f"%{like_uid}%").execute()

            if response.data:
                print("RESPONSE", response.data)
                for record in response.data:
                    creator_handle = record["creator_handle"]
                    likes_count = record["likes_count"]
                    comments_count = record["comments_count"]

                    # Calculate score
                    score = calculate_score(likes_count, comments_count, weight=1)
                    if creator_handle in creator_scores:
                        creator_scores[creator_handle] += score
                    else:
                        creator_scores[creator_handle] = score

        # Process bookmarked videos
        for video in bookmarks:
            video_url = video.get("Link")
            bookmark_uid = extract_uid(video_url)
            print("BOOKMARK", bookmark_uid)
            if not video_url or not bookmark_uid:
                continue

            # Query the database for this video's data
            response = supabase.table("tiktok_video_data").select(
                "creator_handle, likes_count, comments_count"
            ).like("tiktok_url", f"%{bookmark_uid}%").execute()

            if response.data:
                for record in response.data:
                    creator_handle = record["creator_handle"]
                    likes_count = record["likes_count"]
                    comments_count = record["comments_count"]

                    # Calculate score (bookmarks have higher weight)
                    score = calculate_score(likes_count, comments_count, weight=1.35)
                    if creator_handle in creator_scores:
                        creator_scores[creator_handle] += score
                    else:
                        creator_scores[creator_handle] = score

        # Sort creators by score
        ranked_creators = sorted(
            [
                {"creator_handle": handle, "score": score}
                for handle, score in creator_scores.items()
            ],
            key=lambda x: x["score"],
            reverse=True,
        )

        return Response({
            "message": "Creator recommendations generated.",
            "ranked_creators": ranked_creators
        }, status=200)

    except Exception as e:
        return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=500)

