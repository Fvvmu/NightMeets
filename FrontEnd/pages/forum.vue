<template>
  <div class="forum-container">
    <ul>
      <li v-for="post in posts" :key="post._id" class="forum-post">
        <h3 @click="openPost(post._id)" class="post-link">{{ post.title }}</h3>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
let token = localStorage.getItem("token"); // Pobieranie tokenu z localStorage

const posts = ref([]);
const router = useRouter();

const fetchPosts = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/forum/posts');
    posts.value = response.data;
  } catch (error) {
    console.error('Błąd podczas pobierania postów:', error);
  }
};

const openPost = (postId) => {
  router.push(`/forum/${postId}`);
};

// Sprawdzanie, czy token jest dostępny
if (!token) {
  alert("Musisz się zalogować, aby przeglądać tę stronę.");
  router.push("/login"); // Przekierowanie na stronę logowania
}

onMounted(() => {
  fetchPosts();
});
</script>

<style scoped>
.forum-container {
  padding: 20px;
  width: 100%;
  height: 100%;
}

.forum-post {
  margin-bottom: 10px;
}

.post-link {
font-size: 35px;
  color: purple;
  cursor: pointer;
}

.post-link:hover {
  text-decoration: underline;
}
</style>
