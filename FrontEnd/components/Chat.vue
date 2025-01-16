<script setup>
import { ref, onMounted } from 'vue';
import { io } from 'socket.io-client';
import axios from 'axios';

// Pobierz nazwę użytkownika, rolę i link do zdjęcia profilowego z localStorage po zalogowaniu
const username = localStorage.getItem('username') || 'Nieznany użytkownik';
const role = localStorage.getItem('role');
let profilePictureUrl = localStorage.getItem('profilePictureUrl') || '';

const isAdmin = role === 'admin';

const messages = ref([]);
const newMessage = ref('');

const socket = io('http://localhost:3001', {
  auth: {
    token: localStorage.getItem('token'),
  },
});

onMounted(async () => {
  console.log('Chat component mounted');

  await getUserProfilePicture(); 

  socket.on('connect', () => {
    console.log('Connected to Socket.IO');
  });

  // Dodaj wiadomość do listy wiadomości po odebraniu
  socket.on('chat message', (msg) => {
    messages.value.push(msg);
  });

  // Odsłuchuj, czy nastąpiła zmiana w localStorage
  window.addEventListener('storage', handleStorageChange);
});

// Funkcja wysyłania wiadomości
const sendMessage = () => {
  if (newMessage.value.trim() !== '') {
    const messageObject = {
      username,
      message: newMessage.value,
      isAdmin,
      profilePictureUrl,
    };
    socket.emit('chat message', messageObject);
    newMessage.value = '';
  }
};

// Funkcja do pobrania aktualnych danych użytkownika w celu uzyskania aktualnego zdjęcia profilowego
const getUserProfilePicture = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Brak tokenu. Nie można pobrać danych użytkownika.');
    }

    const response = await axios.get('http://localhost:5000/api/user/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.profilePictureUrl) {
      profilePictureUrl = response.data.profilePictureUrl;
      localStorage.setItem('profilePictureUrl', profilePictureUrl);
    }
  } catch (error) {
    console.error('Błąd podczas pobierania danych użytkownika:', error);
  }
};

// Funkcja do aktualizacji, gdy zmienią się dane w localStorage
const handleStorageChange = (event) => {
  if (event.key === 'profilePictureUrl') {
    profilePictureUrl = event.newValue;
  } else if (event.key === 'username') {
    username = event.newValue;
  }
};

</script>

<template>
  <div class="chat-container">
    <div class="messages">
      <div
        v-for="(message, index) in messages"
        :key="index"
        class="message"
        :class="{ admin: message.isAdmin }"
      >
        <img
          v-if="message.profilePictureUrl"
          :src="message.profilePictureUrl"
          alt="Awatar"
          class="chat-avatar"
        />
        <strong>{{ message.username }}:</strong> {{ message.message }}
      </div>
    </div>

    <div class="input-container">
      <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Napisz wiadomość..." />
      <button @click="sendMessage">Wyślij</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
$chat-bg-color: #1a1a1a;
$input-border-color: #ccc;
$button-bg-color: #444;
$button-hover-color: #666;
$admin-color: red;
$avatar-size: 30px;
$border-radius: 4px;

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;

  .messages {
    flex: 1;
    overflow-y: 100%;
    padding: 10px;
  }

  .input-container {
    display: flex;
    padding: 10px;
    border-top: 1px solid $input-border-color;
    background-color: $chat-bg-color;

    input {
      flex: 1;
      padding: 10px;
      font-size: 1rem;
      border: 1px solid $input-border-color;
      border-radius: $border-radius;
    }

    button {
      margin-left: 10px;
      padding: 10px 20px;
      font-size: 1rem;
      cursor: pointer;
      background-color: $button-bg-color;
      color: white;
      border: none;
      border-radius: $border-radius;

      &:hover {
        background-color: $button-hover-color;
      }
    }
  }

  .message {
    margin-bottom: 10px;

    &.admin {
      color: $admin-color;
    }

    .chat-avatar {
      width: $avatar-size;
      height: $avatar-size;
      border-radius: 50%;
      margin-right: 10px;
    }
  }
}
</style>