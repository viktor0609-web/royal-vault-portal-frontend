# YouTube Upload Debug Guide

## Quick Test Steps

1. **Open the test page**: Go to `http://localhost:8080/youtube-test`
2. **Check the status cards** to see what's working and what's not
3. **Look at the debug logs** for detailed information about any errors

## Common Issues & Solutions

### 1. Environment Configuration Issues
**Symptoms**: Environment validation fails
**Solution**: 
- Check that your `.env` file has all required variables
- Ensure no placeholder values like `your_youtube_api_key_here`
- Verify the Client ID format: `xxxxxx.apps.googleusercontent.com`

### 2. Google Cloud Console Configuration
**Symptoms**: OAuth redirect errors
**Solution**:
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Navigate to APIs & Services > Credentials
- Edit your OAuth 2.0 Client ID
- Add these Authorized redirect URIs:
  - `http://localhost:8080/auth/youtube/callback`
  - `https://localhost:8080/auth/youtube/callback`
  - Your production domain + `/auth/youtube/callback`

### 3. YouTube API Quota Issues
**Symptoms**: "quota exceeded" errors
**Solution**:
- Check your YouTube API quota in Google Cloud Console
- Wait for quota to reset (daily limit)
- Consider upgrading to a paid plan if needed

### 4. Authentication Issues
**Symptoms**: "unauthorized" or "forbidden" errors
**Solution**:
- Clear browser storage: `localStorage.clear()`
- Re-authenticate with YouTube
- Ensure you have a YouTube channel

### 5. File Upload Issues
**Symptoms**: Upload fails or gets stuck
**Solution**:
- Check file size (max 2GB)
- Ensure file format is supported (MP4, WebM, etc.)
- Check browser console for network errors

## Debug Information

The test page shows:
- ✅ **Environment Status**: All required variables configured
- ✅ **API Status**: 
  - API Initialized: YouTube API loaded successfully
  - Credentials: API key and OAuth credentials valid
  - Authenticated: User logged in to YouTube

## Test Upload Process

1. Click "Authenticate with YouTube" (if not already authenticated)
2. Click "Test Upload" to upload a small test video
3. Watch the debug logs for detailed progress information
4. Check if the video appears on your YouTube channel

## Error Messages & Meanings

- `Environment validation failed`: Check your `.env` file
- `No access token available`: Need to authenticate with YouTube
- `YouTube API quota exceeded`: Wait or upgrade quota
- `You do not have permission`: Check YouTube channel permissions
- `Failed to initialize upload`: Check API credentials and permissions
- `Upload failed due to network error`: Check internet connection

## Production Checklist

Before deploying to production:
- [ ] Update redirect URIs in Google Cloud Console
- [ ] Set production environment variables
- [ ] Test with real video files
- [ ] Monitor API quota usage
- [ ] Set up error monitoring

## Support

If issues persist:
1. Check browser console for detailed error messages
2. Verify all environment variables are correct
3. Test with the YouTube API directly using their documentation
4. Check Google Cloud Console for any service issues
