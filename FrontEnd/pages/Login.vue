<template>
  <div class="login-container">
    <h2>Logowanie</h2>
    <form @submit.prevent="loginUser">
      <input v-model="loginIdentifier" type="text" placeholder="E-mail lub nazwa użytkownika" required />
      <input v-model="password" type="password" placeholder="Hasło" required />
      <button type="submit">Zaloguj się</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const loginIdentifier = ref('');
const password = ref('');

const loginUser = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      loginIdentifier: loginIdentifier.value,
      password: password.value,
    });

    const { token, username, role } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('role', role);

    window.dispatchEvent(new Event("storage"));

    router.push({ path: '/', replace: true });
  } catch (error) {
    console.error('Błąd logowania:', error);
    alert('Nieprawidłowy e-mail, nazwa użytkownika lub hasło.');
  }
};
</script>

<style scoped lang="scss">
$primary-color: #1a1a1a;
$button-color: #444;
$button-hover-color: #666;
$input-border-radius: 4px;

.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  background-color: $primary-color;
  color: white;
  border-radius: 8px;
  text-align: center;


  h2 {
    text-align: center;
    margin-bottom: 20px;
  }

  form {
    display: flex;
    flex-direction: column;


    input {
      display: block;
      width: 95%;
      margin: 10px 0;
      padding: 10px;
      border: none;
      border-radius: $input-border-radius;
      font-size: 16px;
     
    
    }

    button {
      padding: 10px;
      background-color: $button-color;
      color: white;
      border: none;
      border-radius: $input-border-radius;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;

      &:hover {
        background-color: $button-hover-color;
      }
    }
  }
}
</style>