#!/usr/bin/env python3
"""
Cloudflare R2 ga r2-upload/ ичидаги barcha rasmlarni yuklaydi (S3-compatible).
Env kerak:
  R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET
Ishga tushirish:
  R2_ACCOUNT_ID=... R2_ACCESS_KEY_ID=... R2_SECRET_ACCESS_KEY=... R2_BUCKET=asia-way \
    python scripts/r2_upload.py
"""
import os, glob, boto3

ACCOUNT = os.environ["R2_ACCOUNT_ID"]
KEY = os.environ["R2_ACCESS_KEY_ID"]
SECRET = os.environ["R2_SECRET_ACCESS_KEY"]
BUCKET = os.environ["R2_BUCKET"]

s3 = boto3.client(
    "s3",
    endpoint_url=f"https://{ACCOUNT}.r2.cloudflarestorage.com",
    aws_access_key_id=KEY,
    aws_secret_access_key=SECRET,
    region_name="auto",
)

root = os.path.join(os.path.dirname(__file__), "..", "r2-upload")
files = glob.glob(os.path.join(root, "**", "*.webp"), recursive=True)
for f in sorted(files):
    key = os.path.relpath(f, root).replace("\\", "/")  # masalan apartments/apt-34780000.webp
    s3.upload_file(
        f, BUCKET, key,
        ExtraArgs={"ContentType": "image/webp", "CacheControl": "public, max-age=31536000, immutable"},
    )
    print("uploaded", key)

print(f"\nJami {len(files)} fayl yuklandi -> bucket '{BUCKET}'")
