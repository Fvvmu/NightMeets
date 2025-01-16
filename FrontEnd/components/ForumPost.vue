<template>
  <div class="forum-post-details">
    <h1>{{ post.title }}</h1>
    <p>{{ post.content }}</p>
    <hr />
    <div>
      <h3>Komentarze</h3>
      <ul>
        <li v-for="comment in comments" :key="comment._id">
          <b>{{ comment.user.username }}:</b> {{ comment.text }}
        </li>
      </ul>
      <textarea v-model="newComment" placeholder="Dodaj komentarz..." />
      <button @click="addComment">Dodaj</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const post = ref({});
const comments = ref([]);
const newComment = ref('');

const fetchPostDetails = async () => {
  try {
    const response = await axios.get(`http://localhost:5000/api/forum/${route.params.id}`);
    post.value = response.data.post;
    comments.value = response.data.comments;
  } catch (error) {
    console.error('Błąd podczas pobierania szczegółów posta:', error);
  }
};

const addComment = async () => {
  if (!newComment.value.trim()) {
    alert('Treść komentarza nie może być pusta.');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `http://localhost:5000/api/forum/${route.params.id}/comments`,
      { content: newComment.value },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    comments.value.push(response.data.comment);
    newComment.value = '';
  } catch (error) {
    console.error('Błąd podczas dodawania komentarza:', error);
  }
};

onMounted(() => {
  fetchPostDetails();
});
</script>

<style scoped>
textarea {
  width: 100%;
  margin: 10px 0;
}

button {
  padding: 10px;
  background-color: gray;
  color: white;
  border: none;
  cursor: pointer;
}
</style>
