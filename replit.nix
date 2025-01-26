
{ pkgs }: {
  nixpkgs.config.permittedInsecurePackages = [ "openssl-1.1.1w" ];
  deps = [
    pkgs.openssl_1_1
    pkgs.nodejs-20_x
    pkgs.openssl
    pkgs.openssl_1_1
    pkgs.prisma-engines
  ];
  env = {
    PKG_CONFIG_PATH = "${pkgs.openssl.dev}/lib/pkgconfig";
    OPENSSL_DIR = "${pkgs.openssl.out}";
    OPENSSL_LIB_DIR = "${pkgs.openssl.out}/lib";
    OPENSSL_INCLUDE_DIR = "${pkgs.openssl.dev}/include";
    LD_LIBRARY_PATH = "${pkgs.openssl_1_1}/lib";
  };
  nixConfig = {
    extra-substituters = ["https://nixos-static.cachix.org"];
    extra-trusted-public-keys = ["nixos-static.cachix.org-1:qW1D1lcmjKJnX7Y9ofvkEcD1f2g5+s0v5a8iWxAVCpE="];
    permittedInsecurePackages = [
      "openssl-1.1.1w"
    ];
  };
}
