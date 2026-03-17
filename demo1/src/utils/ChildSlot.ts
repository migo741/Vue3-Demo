// <div>
//     <slot name="header" :title="title"></slot>
//     <slot>默认内容</slot>
//     <slot name="footer"></slot>
// </div>
import { h, type FunctionalComponent } from "vue";
const ChildSlot: FunctionalComponent = (props, { slots }) => {
  console.log(slots.header?.({ title: "我是标题" }));
  return h("div", null, [
    slots.header?.({ title: "我是标题" }),
    slots.default?.() ? slots.default?.() : "你连默认内容都没有提供！",
    slots.footer?.(),
  ]);
};
export default ChildSlot;
