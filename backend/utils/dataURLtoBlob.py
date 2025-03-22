import base64

def dataURLtoBlob(data_url):
    """
    Converts a Base64 Data URL to a binary blob (bytes object in Python).

    Args:
        data_url (str): The Base64 Data URL (e.g., "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...")

    Returns:
        bytes: A bytes object representing the image.
    """
    # Split the Data URL into two parts: the metadata and the Base64 data
    parts = data_url.split(',')
    if len(parts) != 2:
        raise ValueError("Invalid Data URL format")

    # Extract the Base64 data
    base64_data = parts[1]

    # Decode the Base64 data into binary
    blob = base64.b64decode(base64_data)

    return blob