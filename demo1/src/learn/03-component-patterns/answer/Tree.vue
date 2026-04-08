<template>
  <div class="tree">
    <TreeNode
      v-for="node in data"
      :key="node.id"
      :node="node"
      :level="0"
      :show-checkbox="showCheckbox"
      :expanded-keys="expandedKeysSet"
      :checked-keys="checkedKeysSet"
      @toggle-expand="handleToggleExpand"
      @toggle-check="handleToggleCheck"
    >
      <template #node="slotProps">
        <slot name="node" v-bind="slotProps" />
      </template>
    </TreeNode>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import TreeNode from "./TreeNode.vue";

interface TreeNodeData {
  id: number;
  label: string;
  children?: TreeNodeData[];
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<{
    data: TreeNodeData[];
    defaultExpandedKeys?: number[];
    showCheckbox?: boolean;
  }>(),
  {
    defaultExpandedKeys: () => [],
    showCheckbox: false,
  },
);

const emit = defineEmits<{
  check: [checkedKeys: number[]];
  expand: [expandedKeys: number[]];
}>();

const expandedKeys = ref<Set<number>>(new Set(props.defaultExpandedKeys));
const checkedKeys = ref<Set<number>>(new Set());

const expandedKeysSet = computed(() => expandedKeys.value);
const checkedKeysSet = computed(() => checkedKeys.value);

const handleToggleExpand = (id: number) => {
  if (expandedKeys.value.has(id)) {
    expandedKeys.value.delete(id);
  } else {
    expandedKeys.value.add(id);
  }
  // 触发响应式更新
  expandedKeys.value = new Set(expandedKeys.value);
  emit("expand", Array.from(expandedKeys.value));
};

// 获取节点的所有后代 id
function getDescendantIds(node: TreeNodeData): number[] {
  const ids: number[] = [];
  if (node.children) {
    for (const child of node.children) {
      if (!child.disabled) {
        ids.push(child.id);
        ids.push(...getDescendantIds(child));
      }
    }
  }
  return ids;
}

// 查找节点
function findNode(nodes: TreeNodeData[], id: number): TreeNodeData | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

// 查找父节点
function findParent(
  nodes: TreeNodeData[],
  targetId: number,
  parent: TreeNodeData | null = null,
): TreeNodeData | null {
  for (const node of nodes) {
    if (node.id === targetId) return parent;
    if (node.children) {
      const found = findParent(node.children, targetId, node);
      if (found) return found;
    }
  }
  return null;
}

// 更新父节点选中状态
function updateParentCheck(nodeId: number) {
  const parent = findParent(props.data, nodeId);
  if (!parent) return;

  const enabledChildren = (parent.children || []).filter((c) => !c.disabled);
  const allChecked = enabledChildren.every((c) => checkedKeys.value.has(c.id));

  if (allChecked && enabledChildren.length > 0) {
    checkedKeys.value.add(parent.id);
  } else {
    checkedKeys.value.delete(parent.id);
  }

  // 递归向上更新
  updateParentCheck(parent.id);
}

const handleToggleCheck = (id: number) => {
  const node = findNode(props.data, id);
  if (!node || node.disabled) return;

  const isChecked = checkedKeys.value.has(id);

  if (isChecked) {
    // 取消选中：取消自身和所有后代
    checkedKeys.value.delete(id);
    getDescendantIds(node).forEach((did) => checkedKeys.value.delete(did));
  } else {
    // 选中：选中自身和所有后代
    checkedKeys.value.add(id);
    getDescendantIds(node).forEach((did) => checkedKeys.value.add(did));
  }

  // 更新父节点状态
  updateParentCheck(id);

  checkedKeys.value = new Set(checkedKeys.value);
  emit("check", Array.from(checkedKeys.value));
};
</script>

<style scoped>
.tree {
  font-size: 14px;
  user-select: none;
}
</style>
