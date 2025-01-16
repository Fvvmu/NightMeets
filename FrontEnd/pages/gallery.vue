<template>
  <div class="gallery-container">
    <div class="add-image-section">
      <input type="file" @change="onFileChange" accept="image/*" />
      <button @click="uploadImage" :disabled="!newImage">Dodaj Zdjęcie</button>
    </div>

    <div class="image-grid">
      <div v-for="(image, index) in images" :key="index" class="image-item">
        <img :src="`http://localhost:5000/uploads/${image.filename}`" :alt="image.alt" @click="openImageModal(image)" />
      </div>
    </div>

    <!-- Modal -->
    <div v-if="selectedImage" class="modal">
      <div class="modal-content">
        <button class="close" @click="closeImageModal">×</button>
        <img :src="`http://localhost:5000/uploads/${selectedImage.filename}`" :alt="selectedImage.alt" class="modal-image" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router"; // Import routera

const router = useRouter(); // Inicjalizowanie routera

const images = ref([]);
const newImage = ref(null);
const selectedImage = ref(null);
const newComment = ref("");
let token = localStorage.getItem("token"); // Pobieranie tokenu z localStorage

// Dekodowanie tokena, aby uzyskać userId
const decodedToken = token ? JSON.parse(atob(token.split('.')[1])) : null;
const userId = decodedToken?.userId;

// Pobranie obrazów z serwera
const fetchImages = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/gallery", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.data && response.data.length > 0) {
      images.value = response.data.map((file) => ({
        id: file.id,
        filename: file.filename,
        alt: `Zdjęcie przesłane dnia ${file.uploadDate}`,
        likes: file.likes || 0,
        comments: file.comments || [],
        liked: false,
      }));
    }
  } catch (error) {
    console.error("Błąd podczas pobierania zdjęć:", error);
  }
};

// Wybór pliku do uploadu
const onFileChange = (event) => {
  newImage.value = event.target.files[0];
};

// Wysłanie zdjęcia na serwer
const uploadImage = async () => {
  if (newImage.value) {
    try {
      const formData = new FormData();
      formData.append("file", newImage.value);

      const response = await axios.post("http://localhost:5000/api/gallery/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.filename) {
        images.value.push({
          id: response.data.id,
          filename: response.data.filename,
          alt: `Dodane zdjęcie ${images.value.length + 1}`,
          liked: false,
          likes: 0,
          comments: [],
        });
      }
      newImage.value = null;
    } catch (error) {
      console.error("Błąd podczas przesyłania pliku:", error.response?.data || error.message);
    }
  }
};

// Otwórz modal z obrazem
const openImageModal = async (image) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/gallery/${image.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    selectedImage.value = {
      ...image,
      likes: response.data.likes,
      comments: response.data.comments,
    };
  } catch (error) {
    console.error("Błąd podczas pobierania szczegółów zdjęcia:", error.response?.data || error.message);
  }
};

// Zamknięcie modalu
const closeImageModal = () => {
  selectedImage.value = null;
};


onMounted(fetchImages);
</script>

<style scoped>
.gallery-container {
  padding: 20px;
  color: #fff;
}

.add-image-section {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 2px solid white;
  border-radius: 4px;
}

.add-image-section input {
  padding: 10px;
}

button {
  padding: 10px 15px;
  background-color: #444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #666;
}

button:disabled {
  background-color: #999;
  cursor: not-allowed;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.image-item img {
  width: 100%;
  height: auto;
  max-width: 300px;
  max-height: 300px;
  object-fit: contain;
  cursor: pointer;
}

.image-item img:hover {
  transform: scale(1.05);
  transition: transform 0.3s ease;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: #333;
  padding: 20px;
  border-radius: 8px;
  max-width: 40%;
  position: relative;
}

.close {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 2rem;
  color: white;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 10;
}

.modal-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
