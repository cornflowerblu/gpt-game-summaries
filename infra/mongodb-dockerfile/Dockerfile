FROM mongo:6.0

# Install Python and pip
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install botocore
RUN pip3 install botocore

# The rest of the MongoDB container remains the same