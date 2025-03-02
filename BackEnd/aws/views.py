from rest_framework.decorators import api_view, parser_classes
import boto3
from django.http import JsonResponse
import os
import datetime
import re
from dotenv import load_dotenv

load_dotenv()

def sanitize_email(email):
    """
    Sanitize email addresses for S3 key usage:
    - Replace '@' with '-at-'
    - Replace '.' with '-'
    """
    return re.sub(r'[@]', '-at-', re.sub(r'[.]', '-', email))

@api_view(['POST'])
def generate_presigned_url(request, email, file_type):
    print("BUCKETS", os.getenv('AWS_S3_BUCKET_NAME'), os.getenv('AWS_REGION'), os.getenv('AWS_ACCESS_KEY_ID'), os.getenv('AWS_SECRET_ACCESS_KEY'))
    s3_client = boto3.client(
        's3',
        region_name=os.getenv('AWS_REGION'),
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
    )

    bucket_name = os.getenv('AWS_S3_BUCKET_NAME')
    if not bucket_name:
        return JsonResponse({'error': 'S3 bucket name is not configured.'}, status=500)

    # Sanitize email to generate a unique S3 object path
    sanitized_email = sanitize_email(email)
    if not sanitized_email:
        return JsonResponse({'error': 'Invalid email provided.'}, status=400)

    if file_type not in ['json', 'png', 'jpg', 'jpeg']:
        return JsonResponse({'error': 'Invalid file type. Supported types are json, png, jpg, jpeg.'}, status=400)

    # Dynamically generate paths ( each item is going to be stored in 2 places in our s3 )
    timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
    try:
        if file_type == 'json':
            print("JSONmomoa")
            # JSON: TikTok data
            user_object_key = f"Users/{sanitized_email}/TikTokData/tiktok-data.json"
            general_object_key = f"TikTokData/{sanitized_email}-tiktok-data.json"

            # Generate pre-signed URLs for both locations
            user_presigned_url = s3_client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': bucket_name,
                    'Key': user_object_key,
                    'ContentType': 'application/json'
                },
                ExpiresIn=604800,
                HttpMethod='PUT'
            )
            general_presigned_url = s3_client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': bucket_name,
                    'Key': general_object_key,
                    'ContentType': 'application/json'
                },
                ExpiresIn=604800,
                HttpMethod='PUT'
            )

            return JsonResponse({
                'user_presigned_url': user_presigned_url,
                'general_presigned_url': general_presigned_url,
                'user_object_key': user_object_key,
                'general_object_key': general_object_key
            })

        elif file_type in ['png', 'jpg', 'jpeg']:
            print("SWERIKRIK")
            # Image: Profile picture
            user_object_key = f"Users/{sanitized_email}/profilePics/profile-pic"
            general_object_key = f"profilePics/{sanitized_email}-profile-pic"

            content_type = 'image/png' if file_type == 'png' else 'image/jpeg'

            # Generate pre-signed URLs for both locations
            user_presigned_url = s3_client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': bucket_name,
                    'Key': user_object_key,
                    'ContentType': content_type
                },
                ExpiresIn=604800,
                HttpMethod='PUT'
            )
            print("USER PRESIGNED URL", user_presigned_url)
            general_presigned_url = s3_client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': bucket_name,
                    'Key': general_object_key,
                    'ContentType': content_type
                },
                ExpiresIn=604800,
                HttpMethod='PUT'
            )
            print("GENERAL PRESIGNED URL", general_presigned_url)
            return JsonResponse({
                'user_presigned_url': user_presigned_url,
                'general_presigned_url': general_presigned_url,
                'user_object_key': user_object_key,
                'general_object_key': general_object_key
            })

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)