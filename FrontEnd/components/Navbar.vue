<template>
  <nav>
    <ul>
      <li><NuxtLink to="/">HOME</NuxtLink></li>
      <li><NuxtLink to="/forum">FORUM</NuxtLink></li>
      <li><NuxtLink to="/gallery">GALERIA</NuxtLink></li>
      <li><NuxtLink to="/contact">KONTAKT</NuxtLink></li>
    </ul>
  </nav>
</template>

<style scoped lang="scss">
$nav-border-color: white;
$nav-hover-transform: -5px;
$font-size: 40px;
$gap-size: 50px;

nav {
  height: auto;

  ul {
    list-style-type: none;
    display: flex;
    gap: $gap-size;
    font-size: $font-size;
    text-decoration: none;
    padding: 0;
    margin: 0 auto;
    justify-content: center;
    border-bottom: 2px solid $nav-border-color;
    height: 60px;

    li {
      transition: transform 0.3s ease;

      &:hover {
        transform: translateY($nav-hover-transform);
      }
    }
  }
}
</style>