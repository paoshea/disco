
{ pkgs }: {
  deps = [
    pkgs.openssl_1_1
    pkgs.nodejs-18_x
    pkgs.prisma-engines
  ];
}
