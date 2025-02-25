import tensorflow_hub as hub
import tensorflow as tf

# Load EfficientNet model using TensorFlow Hub
model_url = "https://tfhub.dev/google/efficientnet/b0/feature-vector/1"
input_shape = (224, 224, 3)

# Define the input layer
inputs = tf.keras.Input(shape=input_shape)

# Add the TensorFlow Hub layer
hub_layer = hub.KerasLayer(model_url, trainable=False)

# Wrap the hub_layer in a Lambda layer to ensure compatibility
outputs = tf.keras.layers.Lambda(lambda x: hub_layer(x))(inputs)

# Create the model
model = tf.keras.Model(inputs=inputs, outputs=outputs)