
{ pkgs }: {
  deps = [
    pkgs.openssl
    pkgs.nodejs-18_x
    pkgs.prisma-engines
  ];
}
