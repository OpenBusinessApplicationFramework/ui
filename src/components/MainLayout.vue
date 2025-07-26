<template>
        <Menubar :model="items" class="topbar">
            <template #start>
            </template>
            <template #item="{ item, props, hasSubmenu, root }">
              <a v-ripple class="flex align-items-center" v-bind="props.action">
                  <span :class="item.icon" />
                  <span class="ml-2">{{ item.label }}</span>
                  <i v-if="hasSubmenu" :class="['pi pi-angle-down', { 'pi-angle-down ml-2': root, 'pi-angle-right ml-auto': !root }]"></i>
              </a>
            </template>
            <template #end>
                <div class="flex align-items-center gap-2">
                    <InputText placeholder="Search" type="text" class="w-8rem sm:w-auto" />
                    <!--<Avatar image="" shape="circle" />-->
                </div>
            </template>
        </Menubar>
      <!-- Router View -->
      
  <div class="content">
        <router-view />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from 'axios';

const router = useRouter();
const route = useRoute()

const items = ref([
  {
      label: 'Home',
      icon: 'pi pi-home',
      command: () => router.push("/"),
  },
  {
      label: 'Projects',
      icon: 'pi pi-search',
      items: [
          {
              label: 'Datagrid',
              icon: 'pi pi-pencil',
              command: () => router.push("/crud"),
          },
      ]
  }
]);

async function loadMenuItems() {
  try {
    const response = await axios.get(
      `/api/menu?category=`
    );
    //items.value = response.data;
  } catch (error) {
    console.error('Error loading menu:', error);
  }
}

onMounted(() => {
  loadMenuItems();
});
</script>

<style scoped>

.card {
  display: flex;
  flex-direction: column;
}

.topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: white;
}

.content {
  margin-top: 60px;
}
</style>