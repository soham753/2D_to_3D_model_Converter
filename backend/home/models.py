from mongoengine import Document, StringField, DateTimeField, ReferenceField
import datetime

class Design(Document):
    user_id = StringField(required=True)               # Store user ID (as string or ObjectId if needed)
    image_url = StringField(required=True)   
    upload_time = DateTimeField(default=datetime.datetime.utcnow)  # Timestamp of the image upload
