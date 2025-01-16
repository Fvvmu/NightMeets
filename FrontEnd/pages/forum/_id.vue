<template>
  <div>
    <h1 v-if="post && post.title" class="post-title">{{ post.title }}</h1>
    <h1 v-else class="post-title">Brak tytułu</h1>

    <div v-if="post && post.content" class="post-details">
      <p class="post-info highlighted"><strong>Miejsce:</strong> {{ getDetail(post.content, 'Miejsce') }}</p>
      <p class="post-info highlighted"><strong>Organizator:</strong> {{ getDetail(post.content, 'Organizator') }}</p>
      <p class="post-info highlighted"><strong>Data:</strong> {{ getDetail(post.content, 'Data') }}</p>
      <p class="post-info highlighted"><strong>Godzina:</strong> {{ getDetail(post.content, 'Godzina') }}</p>
    </div>
    <div v-else>
      <p class="post-info">Brak szczegółów dotyczących spotkania.</p>
    </div>

    <h2 class="comment-title">Komentarze:</h2>
    <ul class="comment-list">
      <li v-for="comment in comments" :key="comment._id" class="comment-item">
        <strong class="comment-user">{{ comment.user?.username || "Anonim" }}</strong>: {{ comment.text }}
      </li>
    </ul>

    <textarea v-model="newComment" placeholder="Dodaj komentarz..." class="textarea"></textarea>
    <button @click="addComment" class="button">Dodaj komentarz</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const post = ref(null);
const comments = ref([]);
const newComment = ref('');

// Funkcja do wyciągania szczegółów z treści posta
const getDetail = (content, label) => {
  try {
    if (!content) return 'Nieznane';
    const regex = new RegExp(`\\*\\*${label}:\\*\\*\\s*(.+)`, 'i');
    const match = content.match(regex);
    return match ? match[1].trim() : 'Nieznane';
  } catch {
    return 'Nieznane';
  }
};

// Pobieranie danych posta
const fetchPost = async () => {
  try {
    const response = await axios.get(`http://localhost:5000/api/forum/posts/${route.params.id}`);
    console.log("Pobrano dane posta:", response.data);
    post.value = response.data.post || {};
  } catch (error) {
    console.error('Błąd podczas pobierania posta:', error);
  }
};

// Pobieranie komentarzy
const fetchComments = async () => {
  try {
    const response = await axios.get(`http://localhost:5000/api/forum/posts/${route.params.id}/comments`);
    console.log("Pobrano komentarze:", response.data);
    comments.value = response.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } catch (error) {
    console.error('Błąd podczas pobierania komentarzy:', error);
  }
};

// Dodawanie nowego komentarza
const addComment = async () => {
  if (!newComment.value.trim()) {
    alert('Treść komentarza nie może być pusta.');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `http://localhost:5000/api/forum/posts/${route.params.id}/comments`,
      { content: newComment.value },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("Dodano komentarz:", response.data);
    comments.value.push(response.data.comment);
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
.post-title {
  font-size: 3rem;
  color: purple;
  text-align: center;
  margin-bottom: 20px;
  text-transform: uppercase;
}

.post-details {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #222;
  border-radius: 10px;
}

.post-info {
  font-size: 1.5rem;
  color: #ddd;
  margin: 10px 0;
}

.highlighted {
  color: white;
  font-weight: bold;
}

.comment-title {
  font-size: 2rem;
  color: purple;
  margin-bottom: 15px;
}

.comment-list {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
}

.comment-item {
  font-size: 1.4rem;
  margin-bottom: 10px;
  padding: 10px;
  background-color: #333;
  border-radius: 8px;
  color: #fff;
}

.comment-user {
  color: grey;
}

.textarea {
  width: 98%;
  height: 120px;
  margin: 15px 0;
  border-radius: 8px;
  padding: 10px;
  font-size: 1.2rem;
  background-color: #222;
  color: #fff;
}

.button {
  padding: 12px;
  background-color: purple;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
}

.button:hover {
  background-color: #9933cc;
}
</style>