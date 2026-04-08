/**
 * 命令式 Message 组件
 *
 * TODO: 实现函数式调用的 Message
 *
 * 使用方式：
 *   Message.success('操作成功')
 *   Message.error('操作失败')
 *   Message.warning('请注意')
 *   Message.info('提示信息')
 *
 *   const close = Message.success('loading...')
 *   close() // 手动关闭
 *
 *   Message.closeAll()
 *
 * 提示：
 * - 使用 h() + render() 或 createApp() 动态创建组件
 * - 管理一个 message 实例数组
 * - 每个 message 需要计算自己的 top 位置
 */

import { h, render, type VNode } from "vue";
// import MessageComponent from './Message.vue'

type MessageType = "success" | "error" | "warning" | "info";

interface MessageOptions {
  content: string;
  duration?: number;
  closable?: boolean;
  onClose?: () => void;
}

interface MessageInstance {
  close: () => void;
}

// TODO: 实现 Message 类
class MessageManager {
  private instances: MessageInstance[] = [];

  success(options: string | MessageOptions): () => void {
    // TODO
    return () => {};
  }

  error(options: string | MessageOptions): () => void {
    // TODO
    return () => {};
  }

  warning(options: string | MessageOptions): () => void {
    // TODO
    return () => {};
  }

  info(options: string | MessageOptions): () => void {
    // TODO
    return () => {};
  }

  closeAll(): void {
    // TODO
  }
}

export const Message = new MessageManager();
export default Message;
