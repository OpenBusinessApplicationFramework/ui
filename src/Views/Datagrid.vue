<template>
  <div>
    <div class="flex justify-between mb-4 items-center">
      <Button
        label="Add Entry"
        icon="pi pi-plus"
        class="mr-1"
        @click="addEntry"
        aria-label="Add Entry"
      />

      <div class="flex-shrink-0 mr-1">
        <IconField>
          <InputText v-model="globalFilter" placeholder="Keyword Search" />
        </IconField>
      </div>

      <div
        v-if="generalExecutions.length"
        class="inline-flex border border-gray-300 rounded-lg overflow-hidden w-auto"
      >
        <Select
          v-model="selectedGeneralExecution"
          :options="generalExecutions"
          filter
          optionLabel="label"
          placeholder="Select to execute"
          class="w-40 flex-shrink-0"
          style="width:180px"
        />
        <Button
          icon="pi pi-play"
          :disabled="!selectedGeneralExecution"
          @click="executeGeneral"
          class="!rounded-none !border-0 !border-l border-gray-300"
          aria-label="Run"
        />
      </div>
    </div>

    <DataTable
      :value="data"
      lazy
      paginator
      :first="first"
      :rows="rows"
      :total-records="totalRecords"
      :loading="loading"
      @page="onPage"
      dataKey="id"
      ref="dt"
    >
      <template #empty>No entries found.</template>
      <template #loading>Loading data. Please wait.</template>

      <Column
        v-for="col in columns"
        :key="col.field"
        :field="col.field"
        :header="col.header"
      >
        <template #body="slotProps">
          <span v-if="Array.isArray(slotProps.data[col.field])">
            {{ slotProps.data[col.field].join(', ') }}
          </span>
          <span v-else>
            {{ slotProps.data[col.field] }}
          </span>
        </template>
      </Column>

      <Column header="Actions" style="width:6rem" :exportable="false">
        <template #body="slotProps">
          <Button
            icon="pi pi-pencil"
            class="p-button-text"
            @click="openEditDialog(slotProps.data)"
          />
        </template>
      </Column>
    </DataTable>

    <Dialog
      v-model:visible="editDialog"
      header="Edit Entry"
      :modal="true"
      class="p-fluid"
      :style="{ width: '450px' }"
    >
      <div
        v-if="dialogExecutions.length"
        class="inline-flex mb-3 border border-gray-300 rounded-lg overflow-hidden w-auto"
      >
        <Select
          v-model="selectedDialogExecution"
          :options="dialogExecutions"
          filter
          optionLabel="label"
          placeholder="Select to execute"
          class="!rounded-none !border-0 w-40"
        />
        <Button
          icon="pi pi-play"
          :disabled="!selectedDialogExecution"
          @click="executeDialog"
          class="!rounded-none !border-0 !border-l border-gray-300"
          aria-label="Run"
        />
      </div>

      <div v-if="formInvalid" class="p-error mb-3">
        There are errors in the highlighted fields.
      </div>

      <div v-for="col in columns" :key="col.field" class="p-field">
        <label :for="col.field">{{ col.header }}</label>
        <Chips
          v-if="col.multipleValues"
          :id="col.field"
          v-model="editedEntry[col.field]"
          :disabled="col.readOnly"
          :class="{ 'p-invalid': !isFieldValid(col) }"
          style="width: 100%;"
        />
        <InputText
          v-else
          :id="col.field"
          v-model.trim="editedEntry[col.field]"
          :disabled="col.readOnly"
          :class="{ 'p-invalid': !isFieldValid(col) }"
          style="width: 100%;"
        />
      </div>

      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="hideEditDialog" />
        <Button label="Save" icon="pi pi-check" text @click="saveEdit" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Chips from 'primevue/chips';
import Select from 'primevue/select';
import api from '@/utils/api';

const props = defineProps(['caseName','topLevelTagName']);
const columns = ref([]);
const data = ref([]);
const totalRecords = ref(0);
const loading = ref(false);
const first = ref(0);
const rows = ref(10);
const globalFilter = ref('');
const editDialog = ref(false);
const editedEntry = ref({});
const originalEntry = ref({});
const isAddMode = ref(false);
const formInvalid = computed(() => columns.value.some(col => !isFieldValid(col)));
const generalExecutions = ref([]);
const dialogExecutions = ref([]);
const selectedGeneralExecution = ref(null);
const selectedDialogExecution = ref(null);
const KEY_GENERAL = 'generalExecutions';
const KEY_DIALOG = 'dialogExecutions';

function loadExecutionsFromStorage() {
  try {
    const ge = localStorage.getItem(KEY_GENERAL);
    const de = localStorage.getItem(KEY_DIALOG);
    if (ge) generalExecutions.value = JSON.parse(ge);
    if (de) dialogExecutions.value = JSON.parse(de);
  } catch (e) {
    console.error(e);
  }
}

async function executeGeneral() {
  if (!selectedGeneralExecution.value?.uri) return;
  loading.value = true;
  try {
    await api.get(selectedGeneralExecution.value.uri);
    await loadData();
  } finally {
    loading.value = false;
  }
}

async function executeDialog() {
  if (!selectedDialogExecution.value?.uri) return;
  try {
    await api.post(selectedDialogExecution.value.uri, { entryIds: originalEntry.value.__entries });
    hideEditDialog();
    await loadData();
  } catch (e) {
    console.error(e);
  }
}

async function loadColumns() {
  loading.value = true;
  try {
    const res = await api.get(
      `/DataAnnotation/${props.caseName}/tag/odata`,
      {
        params: {
          getSubTagsFromTopTag: props.topLevelTagName,
          $select: 'Id',
          $expand: 'dataEntries($select=Id;$expand=dataDefinition($select=Name,MultipleValues,ReadOnly,IsValid))'
        }
      }
    );
    const map = {};
    res.data.forEach(ds =>
      ds.DataEntries.forEach(de => {
        const def = de.DataDefinition;
        if (def && !map[def.Name]) {
          map[def.Name] = {
            field: def.Name,
            header: def.Name,
            multipleValues: def.MultipleValues,
            readOnly: def.ReadOnly,
            defValid: def.IsValid ?? true
          };
        }
      })
    );
    columns.value = Object.values(map);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

async function loadData() {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    params.append('$skip', String(first.value));
    params.append('$top', String(rows.value));
    params.append('$count', 'true');
    params.append('getSubTagsFromTopTag', props.topLevelTagName);
    params.append(
      '$expand',
      'DataDefinition($select=Name,MultipleValues,ReadOnly,IsValid),Tags($select=Name)'
    );
    if (globalFilter.value) {
      params.append('globalFilter', globalFilter.value.replace(/'/g, "''"));
    }
    const res = await api.get(
      `/DataEntries/${props.caseName}/inmemoryodata`,
      { params }
    );
    const items = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data.value)
      ? res.data.value
      : [];
    const groups = items.reduce((acc, item) => {
      const subTag =
        item.Tags?.find(t => t.Name !== props.caseName)?.Name || '‹no-tag›';
      if (!acc[subTag]) acc[subTag] = [];
      acc[subTag].push(item);
      return acc;
    }, {});
    data.value = Object.entries(groups).map(([tag, entries]) => {
      const row = { id: tag, __entries: {}, __entryValid: {} };
      entries.forEach(de => {
        const def = de.DataDefinition;
        const key = def.Name;
        const vals = de.Values ?? [];
        row[key] = def.MultipleValues ? [...vals] : vals[0] || '';
        row.__entries[key] = de.Id;
        row.__entryValid[key] = def.IsValid ?? true;
      });
      return row;
    });
    totalRecords.value = Number(res.data['@odata.count'] ?? data.value.length);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

function onPage(event) {
  first.value = event.first;
  rows.value = event.rows;
  loadData();
}

function addEntry() {
  isAddMode.value = true;
  const entry = {};
  columns.value.forEach(col => {
    entry[col.field] = col.multipleValues ? [] : '';
  });
  editedEntry.value = entry;
  editDialog.value = true;
}

function openEditDialog(row) {
  isAddMode.value = false;
  originalEntry.value = row;
  editedEntry.value = JSON.parse(JSON.stringify(row));
  editDialog.value = true;
}

function hideEditDialog() {
  editDialog.value = false;
  selectedDialogExecution.value = null;
}

function isFieldValid(col) {
  return originalEntry.value.__entryValid?.[col.field] && col.defValid;
}

async function saveEdit() {
  if (isAddMode.value) {
    const dtos = columns.value
      .filter(col => !col.readOnly)
      .map(col => ({
        DefinitionName: col.field,
        Values: col.multipleValues
          ? editedEntry.value[col.field].map(String)
          : editedEntry.value[col.field]
            ? [String(editedEntry.value[col.field])]
            : ['']
      }));
    try {
      await api.post(
        `/DataEntries/${props.caseName}/multiple/${props.topLevelTagName}`, dtos, {  }
      );
      hideEditDialog();
      await loadData();
    } catch (err) {
      console.error(err);
    }
  } else {
    const calls = [];
    columns.value.forEach(col => {
      if (col.readOnly) return;
      const f = col.field;
      const orig = originalEntry.value[f];
      const curr = editedEntry.value[f];
      const changed = col.multipleValues
        ? JSON.stringify(curr) !== JSON.stringify(orig)
        : String(curr) !== String(orig);
      const entryId = originalEntry.value.__entries[f];
      if (changed && entryId) {
        calls.push(
          api.put(
            `/DataEntries/${props.caseName}/${entryId}`,
            { Values: col.multipleValues ? curr.map(String) : [String(curr || '')] }
          )
        );
      }
    });
    try {
      await Promise.all(calls);
      hideEditDialog();
      loadData();
    } catch (err) {
      console.error(err);
    }
  }
}

onMounted(async () => {
  loadExecutionsFromStorage();
  await loadColumns();
  await loadData();
});
</script>

<style scoped>
</style>
