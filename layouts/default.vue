<template>
  <div class="container">
    <!-- Barra de navegación -->
    <header>
      <nav class="nav-tabs">
        <NuxtLink v-for="tab in tabsData" :key="tab.path" :to="tab.path" class="nav-item nav-link">
          <MyImage :image="tab.logo"/>
        </NuxtLink>
        <DevOnly>
          <NuxtLink to="/dev" class="nav-item nav-link">
            <MyImage image="hungry.svg"/>
          </NuxtLink>
        </DevOnly>
      </nav>
    </header>

    <!-- Contenido dinámico de cada página -->
    <main class="tab-content">
        <slot class="tab-pane" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
const activeTab = ref<number>(0);
interface Tab {
  id: number;
  text: string;
  logo: string;
  path: string;
  selectable: boolean;
}
const tabsData: Tab[]=[
      { id: 0, text: 'Configuración',          logo: 'config.svg',        path: "/config",      selectable: false,  },
      { id: 1, text: 'Añadir Productos',       logo: 'add.svg',           path: "/add",         selectable: true,   },
      { id: 2, text: 'Por orden alfabético',   logo: 'a2z.svg',           path: "/a2z",         selectable: true,   },
      { id: 3, text: 'Por categoría',          logo: 'categorias.svg',    path: "/categorias",  selectable: true,   },
      { id: 4, text: 'Lista de la compra',     logo: 'cart.svg',          path: "/cart",        selectable: true,   },
    ]
</script>

<style scoped>
.nav-item
{
  min-width:                    25%;
  width:                        100%;
  cursor:                       pointer;
  padding:                      0;
}
.nav-item:nth-child(2).router-link-exact-active .MyImage,
.nav-item:nth-child(5).router-link-exact-active .MyImage,
.nav-item:first-child.router-link-exact-active .MyImage{
  filter:                       grayscale(1) brightness(100) invert(1);
}

.nav-tabs .nav-item.router-link-exact-active{
  background-color:           #e6e6e6;
  color:                      black;
  border:                       0;
}
.nav-tabs .nav-item{
  background-color:           #585858;
  color:                      white;
  display:                      flex;
  height:                       100%;
  justify-content:              center;
  min-width:                    3.4375rem;
}
.nav-tabs{
  --bs-nav-tabs-border-color: #585858;
  justify-content:              space-between;
  height:                       3.125rem;
  display:                      flex;
  flex-direction:               row;
  width:                       100%;
  user-select:                  none;
}
.nav-item:first-child {
  max-width:                    3.75rem;
}

.tab-pane {
  flex-grow:                    1;
  overflow-y:                   auto;
}
.tab-content {
  flex-grow:                    1;
  display:                      flex;
  flex-direction:               column;
  background-color:           #222;
}
main{
    border-radius: 0 0 10px 10px;
}
.container {
  display: flex;
  flex-direction: column;
  height: 98vh;
}

header {
  display: flex;
  justify-content: space-around;
  padding-top: 10px;
  color: white;
}

nav a {
  text-decoration: none;
  color: white;
  padding: 10px;
  margin-left: 1px;
}
nav a:hover {
  background: gray;
}
</style>
