export default function BackdropBlobs() {
  return (
    <div className="bg-blobs-container fixed inset-0 z-[-2] overflow-hidden pointer-events-none opacity-75">
      <div className="blob blob-1 absolute rounded-full filter blur-[120px] mix-blend-multiply w-[500px] h-[500px] bg-accent/15 -top-[10%] -left-[10%] animate-float-blobs-1" />
      <div className="blob blob-2 absolute rounded-full filter blur-[120px] mix-blend-multiply w-[600px] h-[600px] bg-[rgba(39,174,96,0.1)] -bottom-[15%] -right-[5%] animate-float-blobs-2" />
      <div className="blob blob-3 absolute rounded-full filter blur-[120px] mix-blend-multiply w-[400px] h-[400px] bg-[rgba(224,82,72,0.06)] top-[40%] left-[50%] animate-float-blobs-3" />
    </div>
  );
}
