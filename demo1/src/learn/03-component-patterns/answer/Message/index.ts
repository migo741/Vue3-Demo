import { h, render, type VNode } from "vue";
import MessageComponent from "./Message.vue";

type MessageType = "success" | "error" | "warning" | "info";

interface MessageOptions {
  content: string;
  duration?: number;
  closable?: boolean;
  onClose?: () => void;
}

interface MessageInstance {
  id: string;
  close: () => void;
  el: HTMLDivElement;
}

let seed = 0;
const instances: MessageInstance[] = [];
const GAP = 16;

function getOffset(index: number): number {
  let offset = 20;
  for (let i = 0; i < index; i++) {
    offset +=
      (instances[i].el.firstElementChild?.getBoundingClientRect().height ||
        40) + GAP;
  }
  return offset;
}

function updateOffsets() {
  instances.forEach((instance, index) => {
    const el = instance.el.firstElementChild as HTMLElement;
    if (el) {
      el.style.top = `${getOffset(index)}px`;
    }
  });
}

function createMessage(
  type: MessageType,
  options: string | MessageOptions,
): () => void {
  const opts: MessageOptions =
    typeof options === "string" ? { content: options } : options;
  const id = `message_${seed++}`;

  // 创建容器
  const container = document.createElement("div");
  document.body.appendChild(container);

  const index = instances.length;

  const onDestroy = () => {
    // 从实例列表中移除
    const idx = instances.findIndex((i) => i.id === id);
    if (idx !== -1) {
      instances.splice(idx, 1);
    }
    // 清理 DOM
    render(null, container);
    document.body.removeChild(container);
    // 更新剩余 message 的位置
    updateOffsets();
    opts.onClose?.();
  };

  const vnode = h(MessageComponent, {
    type,
    content: opts.content,
    duration: opts.duration ?? 3000,
    closable: opts.closable ?? false,
    offset: getOffset(index),
    onDestroy,
  });

  render(vnode, container);

  const instance: MessageInstance = {
    id,
    el: container,
    close: () => {
      // 通过组件暴露的 close 方法关闭
      (vnode.component?.exposed as any)?.close();
    },
  };

  instances.push(instance);

  return instance.close;
}

export const Message = {
  success(options: string | MessageOptions) {
    return createMessage("success", options);
  },
  error(options: string | MessageOptions) {
    return createMessage("error", options);
  },
  warning(options: string | MessageOptions) {
    return createMessage("warning", options);
  },
  info(options: string | MessageOptions) {
    return createMessage("info", options);
  },
  closeAll() {
    // 倒序关闭，避免索引问题
    [...instances].reverse().forEach((instance) => instance.close());
  },
};

export default Message;
