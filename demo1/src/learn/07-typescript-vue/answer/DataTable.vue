<template>
  <div class="data-table">
    <!-- 加载遮罩 -->
    <div v-if="loading" class="loading-overlay">加载中...</div>

    <table>
      <thead>
        <tr>
          <th v-if="rowKey">
            <input
              type="checkbox"
              :checked="isAllSelected"
              @change="toggleSelectAll"
            />
          </th>
          <th
            v-for="col in columns"
            :key="col.key"
            @click="col.sortable ? handleSort(col.key) : null"
            :class="{ sortable: col.sortable }"
          >
            {{ col.title }}
            <span v-if="col.sortable">
              {{
                sortKey === col.key ? (sortOrder === "asc" ? "↑" : "↓") : "↕"
              }}
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in data" :key="row[rowKey]">
          <td v-if="rowKey">
            <input
              type="checkbox"
              :checked="selectedKeys.has(row[rowKey])"
              @change="toggleSelect(row)"
            />
          </td>
          <td v-for="col in columns" :key="col.key">
            <!-- 具名插槽：column-xxx -->
            <slot :name="`column-${col.key}`" :row="row">
              {{ row[col.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 分页 -->
    <div class="pagination">
      <button :disabled="currentPage <= 1" @click="changePage(currentPage - 1)">
        上一页
      </button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button
        :disabled="currentPage >= totalPages"
        @click="changePage(currentPage + 1)"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

// ---- 类型安全的 Props ----
interface Column {
  key: string;
  title: string;
  sortable?: boolean;
  width?: number;
}

const props = withDefaults(
  defineProps<{
    columns: Column[];
    data: Record<string, any>[];
    loading?: boolean;
    rowKey: string;
    total?: number;
    pageSize?: number;
  }>(),
  {
    loading: false,
    total: 0,
    pageSize: 10,
  },
);

// ---- 类型安全的 Emit ----
const emit = defineEmits<{
  "sort-change": [payload: { key: string; order: "asc" | "desc" }];
  "selection-change": [selectedRows: Record<string, any>[]];
  "page-change": [page: number];
}>();

// ---- 类型安全的 Slots ----
defineSlots<{
  [key: `column-${string}`]: (props: { row: Record<string, any> }) => any;
}>();

// ---- 排序 ----
const sortKey = ref("");
const sortOrder = ref<"asc" | "desc">("asc");

const handleSort = (key: string) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortOrder.value = "asc";
  }
  emit("sort-change", { key: sortKey.value, order: sortOrder.value });
};

// ---- 选择 ----
const selectedKeys = ref<Set<any>>(new Set());

const isAllSelected = computed(() => {
  if (props.data.length === 0) return false;
  return props.data.every((row) => selectedKeys.value.has(row[props.rowKey]));
});

const toggleSelect = (row: Record<string, any>) => {
  const key = row[props.rowKey];
  if (selectedKeys.value.has(key)) {
    selectedKeys.value.delete(key);
  } else {
    selectedKeys.value.add(key);
  }
  selectedKeys.value = new Set(selectedKeys.value);
  emitSelection();
};

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedKeys.value.clear();
  } else {
    props.data.forEach((row) => selectedKeys.value.add(row[props.rowKey]));
  }
  selectedKeys.value = new Set(selectedKeys.value);
  emitSelection();
};

const emitSelection = () => {
  const selectedRows = props.data.filter((row) =>
    selectedKeys.value.has(row[props.rowKey]),
  );
  emit("selection-change", selectedRows);
};

// ---- 分页 ----
const currentPage = ref(1);
const totalPages = computed(() => Math.ceil(props.total / props.pageSize));

const changePage = (page: number) => {
  currentPage.value = page;
  emit("page-change", page);
};

// ---- Expose ----
defineExpose({
  clearSelection: () => {
    selectedKeys.value.clear();
    selectedKeys.value = new Set();
  },
  getSelectedRows: () => {
    return props.data.filter((row) =>
      selectedKeys.value.has(row[props.rowKey]),
    );
  },
});
</script>

<style scoped>
.data-table {
  position: relative;
}
.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
  text-align: left;
}
th.sortable {
  cursor: pointer;
  user-select: none;
}
th.sortable:hover {
  background: #f5f5f5;
}
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px;
}
</style>
