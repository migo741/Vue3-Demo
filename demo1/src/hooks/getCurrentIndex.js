function getCurrentIndex(scrollTop, arr) {
  let left = 0;
  let right = arr.length - 1;
  while (left < right) {
    const mid = Math.floor(left + (right - left) / 2);
    if (arr[mid] < scrollTop) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  return left;
}
export { getCurrentIndex };
