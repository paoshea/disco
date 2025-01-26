
{ pkgs }: {
  nixpkgs.config.permittedInsecurePackages = [ "openssl-1.1.1w" ];
  deps = [
    pkgs.openssl_1_1
    pkgs.nodejs-20_x
    pkgs.prisma-engines
  ];
  env = {
    PKG_CONFIG_PATH = "${pkgs.openssl_1_1.dev}/lib/pkgconfig";
    OPENSSL_DIR = "${pkgs.openssl_1_1.out}";
    OPENSSL_LIB_DIR = "${pkgs.openssl_1_1.out}/lib";
    OPENSSL_INCLUDE_DIR = "${pkgs.openssl_1_1.dev}/include";
    LD_LIBRARY_PATH = "${pkgs.openssl_1_1.out}/lib";
  };
}
