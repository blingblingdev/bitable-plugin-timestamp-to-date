import { ShowToastOptions, bitable } from "@lark-base-open/js-sdk";

export const toast = async (options: ShowToastOptions) => {
  await bitable.ui.showToast(options);
};
