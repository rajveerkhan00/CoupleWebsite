export const uploadImageToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'Kinzazain');
  formData.append('cloud_name', 'duqljgqkh');
  formData.append('api_key', '792328924557649');

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/duqljgqkh/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};