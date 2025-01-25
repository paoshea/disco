
{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x
    pkgs.openssl_1_1
    pkgs.prisma-engines
  ];
  nixConfig = {
    extra-substituters = ["https://nixos-static.cachix.org"];
    extra-trusted-public-keys = ["nixos-static.cachix.org-1:qW1D1lcmjKJnX7Y9ofvkEcD1f2g5+s0v5a8iWxAVCpE="];
    permittedInsecurePackages = [
      "openssl-1.1.1w"
    ];
  };
}
