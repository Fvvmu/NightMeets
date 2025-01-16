<template>
    <div class="forum-container">
      <ul>
        <li v-for="post in posts" :key="post._id">
          <NuxtLink :to="`/forum/${post._id}`">{{ post.title }}</NuxtLink>
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  
  const posts = ref([]);
  
  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/forum/posts');
      posts.value = response.data;
    } catch (error) {
      console.error('Błąd podczas pobierania postów:', error);
    }
  };
  
  onMounted(() => {
    fetchPosts();
  });
  </script>
  
  <style scoped>
  .forum-container {
    padding: 20px;

  }
  
  ul {
    list-style: none;
    padding: 0;
  }
  
  li {
    margin-bottom: 10px;
  }
  </style>