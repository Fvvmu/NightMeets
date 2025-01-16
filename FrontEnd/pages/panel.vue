<template>
  <div class="panel-container">
    <h2>Panel użytkownika</h2>
    <form @submit.prevent="updateUser">
      <div class="input-container">
        <label>Nazwa użytkownika</label>
        <input v-model="username" type="text" placeholder="Nowa nazwa użytkownika" />
      </div>
      <div class="input-container">
        <label>E-mail</label>
        <input v-model="email" type="email" placeholder="Nowy e-mail" />
      </div>
      <div class="input-container">
        <label>Nowe hasło</label>
        <input v-model="password" type="password" placeholder="Zostaw puste, aby nie zmieniać" />
      </div>
      <div class="input-container">
        <label>Zdjęcie profilowe</label>
        <div class="profile-picture-container">
          <img v-if="profilePicUrl" :src="profilePicUrl" alt="Zdjęcie profilowe" class="profile-pic-preview" />
          <input type="file" @change="onFileChange" />
        </div>
      </div>
      <button type="submit">Zapisz zmiany</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const username = ref('');
const email = ref('');
const password = ref('');
const profilePicture = ref(null);
const profilePicUrl = ref('');

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    profilePicture.value = file;
    const reader = new FileReader();
    reader.onloadend = () => {
      profilePicUrl.value = reader.result;
    };
    reader.readAsDataURL(file);
  }
};

const updateUser = async () => {
  try {
    const formData = new FormData();
    formData.append('username', username.value);
    formData.append('email', email.value);
    if (password.value) {
      formData.append('password', password.value);
    }
    if (profilePicture.value) {
      formData.append('profilePicture', profilePicture.value);
    }

    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Brak tokenu. Nie można zaktualizować danych użytkownika.');
    }

    await axios.put('http://localhost:5000/api/user/update', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    alert('Dane zostały zaktualizowane. Zaloguj się ponownie.');

    // Wyczyszczenie danych lokalnych
    localStorage.clear();

    // Przekierowanie do logowania
    router.push('/login').then(() => {
      // Po przekierowaniu odśwież stronę
      location.reload();
    });
  } catch (error) {
    console.error('Błąd podczas aktualizacji danych:', error.response?.data || error.message);
    alert('Wystąpił błąd podczas aktualizacji danych.');
  }
};

const getUserData = async () => {
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

    username.value = response.data.username || '';
    email.value = response.data.email || '';
    profilePicUrl.value = response.data.profilePictureUrl || '';
  } catch (error) {
    console.error('Błąd podczas pobierania danych użytkownika:', error.response?.data || error.message);
    alert('Wystąpił błąd podczas pobierania danych użytkownika.');
  }
};

onMounted(() => {
  getUserData();
});
</script>

<style scoped lang="scss">
$primary-bg: #1a1a1a;
$input-padding: 10px;
$border-radius: 8px;
$button-bg: #444;
$button-hover-bg: #666;

.panel-container {
  max-width: 80%;
  padding: 20px;
  background-color: $primary-bg;
  color: white;
  border-radius: $border-radius;
  box-sizing: border-box;

  h2 {
    text-align: center;
    margin-bottom: 20px;
  }

  .input-container {
    margin-bottom: 15px;

    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }

    input[type='text'],
    input[type='email'],
    input[type='password'],
    input[type='file'] {
      width: 80%;
      padding: $input-padding;
      margin-top: 5px;
      border-radius: $border-radius;
      border: none;
    }
  }

  button {
    padding: $input-padding;
    background-color: $button-bg;
    color: white;
    border: none;
    border-radius: $border-radius;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s;

    &:hover {
      background-color: $button-hover-bg;
    }
  }

  .profile-picture-container {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .profile-pic-preview {
    max-width: 100px;
    max-height: 100px;
    border-radius: 50%;
  }
}
</style>
