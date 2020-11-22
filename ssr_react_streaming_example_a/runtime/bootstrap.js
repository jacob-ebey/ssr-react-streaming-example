export default function bootstrap() {
  if (__BUILD_ENV__ === "client") {
    import("./client/index");
  } else {
    return import("./server/index");
  }
}

if (__BUILD_ENV__ === "client") {
  bootstrap();
}
