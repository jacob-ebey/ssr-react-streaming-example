if (__BUILD_ENV__ === "client") {
  import("./client/index");
} else {
  import("./server/index");
}
