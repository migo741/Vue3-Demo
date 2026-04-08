<template>
  <div class="tree-node" :style="{ paddingLeft: `${level * 20}px` }">
    <div class="tree-node__content" :class="{ disabled: node.disabled }">
      <!-- 展开/折叠箭头 -->
      <span
        class="tree-node__arrow"
        :class="{ expanded: isExpanded, empty: !hasChildren }"
        @click="toggleExpand"
      >
        {{ hasChildren ? "▶" : "" }}
      </span>

      <!-- 复选框 -->
      <input
        v-if="showCheckbox"
        type="checkbox"
        :checked="isChecked"
        :disabled="node.disabled"
        @change="toggleCheck"
        class="tree-node__checkbox"
      />

      <!-- 节点内容 -->
      <span class="tree-node__label" @click="toggleExpand">
        <slot name="node" :node="node" :level="level">
          {{ node.label }}
        </slot>
      </span>
    </div>

    <!-- 递归渲染子节点 -->
    <div v-if="hasChildren && isExpanded" class="tree-node__children">
      <TreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :level="level + 1"
        :show-checkbox="showCheckbox"
        :expanded-keys="expandedKeys"
        :checked-keys="checkedKeys"
        @toggle-expand="$emit('toggle-expand', $event)"
        @toggle-check="$emit('toggle-check', $event)"
      >
        <template #node="slotProps">
          <slot name="node" v-bind="slotProps" />
        </template>
      </TreeNode>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface TreeNodeData {
  id: number;
  label: string;
  children?: TreeNodeData[];
  disabled?: boolean;
}

const props = defineProps<{
  node: TreeNodeData;
  level: number;
  showCheckbox: boolean;
  expandedKeys: Set<number>;
  checkedKeys: Set<number>;
}>();

const emit = defineEmits<{
  "toggle-expand": [id: number];
  "toggle-check": [id: number];
}>();

const hasChildren = computed(() => {
  return props.node.children && props.node.children.length > 0;
});

const isExpanded = computed(() => {
  return props.expandedKeys.has(props.node.id);
});

const isChecked = computed(() => {
  return props.checkedKeys.has(props.node.id);
});

const toggleExpand = () => {
  if (hasChildren.value) {
    emit("toggle-expand", props.node.id);
  }
};

const toggleCheck = () => {
  emit("toggle-check", props.node.id);
};
</script>

<!-- 递归组件需要显式 name -->
<script lang="ts">
export default { name: "TreeNode" };
</script>

<style scoped>
.tree-node__content {
  display: flex;
  align-items: center;
  padding: 4px 0;
  cursor: pointer;
}
.tree-node__content:hover {
  background: #f5f5f5;
}
.tree-node__content.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.tree-node__arrow {
  display: inline-block;
  width: 16px;
  font-size: 10px;
  transition: transform 0.2s;
}
.tree-node__arrow.expanded {
  transform: rotate(90deg);
}
.tree-node__checkbox {
  margin: 0 4px;
}
.tree-node__label {
  margin-left: 4px;
}
</style>
