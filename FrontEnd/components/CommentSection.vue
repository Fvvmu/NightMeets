<template>
  <div class="forum-post-container">
    <h2>{{ post.title }}</h2>
    <p>{{ post.content }}</p>

    <div class="comment-section">
      <h3>Komentarze</h3>
      <ul>
        <li v-for="comment in comments" :key="comment._id">
          <strong>{{ comment.username }}:</strong> {{ comment.text }}
        </li>
      </ul>
      <textarea v-model="newComment" placeholder="Dodaj komentarz"></textarea>
      <button @click="addComment">Dodaj komentarz</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';

const route = useRoute();
const post = ref({});
const comments = ref([]);
const newComment = ref('');

const fetchPost = async () => {
  try {
    const response = await axios.get(`http://localhost:5000/api/forum/posts/${route.params.id}`);
    post.value = response.data;
  } catch (error) {
    console.error('Błąd podczas pobierania posta:', error);
  }
};

const fetchComments = async () => {
  try {
    const response = await axios.get(`http://localhost:5000/api/forum/posts/${route.params.id}/comments`);
    comments.value = response.data;
  } catch (error) {
    console.error('Błąd podczas pobierania komentarzy:', error);
  }
};

const addComment = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `http://localhost:5000/api/forum/posts/${route.params.id}/comments`,
      { text: newComment.value },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    comments.value.push(response.data);
    newComment.value = '';
  } catch (error) {
    console.error('Błąd podczas dodawania komentarza:', error);
  }
};

onMounted(() => {
  fetchPost();
  fetchComments();
});
</script>

<style scoped>
.forum-post-container {
  padding: 20px;
}

.comment-section {
  margin-top: 20px;
}

textarea {
  width: 100%;
  height: 80px;
  margin: 10px 0;
  padding: 10px;
}
</style>