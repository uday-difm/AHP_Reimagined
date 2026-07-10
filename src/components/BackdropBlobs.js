export default function BackdropBlobs() {
  return (
    <div className="bg-blobs-container fixed inset-0 z-[-2] overflow-hidden pointer-events-none opacity-50">
      <div className="blob blob-1 absolute rounded-full filter blur-[100px] w-[450px] h-[450px] bg-accent/10 -top-[5%] -left-[5%] animate-float-blobs-1 will-change-transform" />
      <div className="blob blob-2 absolute rounded-full filter blur-[100px] w-[500px] h-[500px] bg-[rgba(39,174,96,0.08)] -bottom-[10%] -right-[5%] animate-float-blobs-2 will-change-transform" />
      <div className="blob blob-3 absolute rounded-full filter blur-[100px] w-[350px] h-[350px] bg-[rgba(224,82,72,0.04)] top-[40%] left-[45%] animate-float-blobs-3 will-change-transform" />
    </div>
  );
}
