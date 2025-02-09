
{ pkgs }: {
  deps = [
    pkgs.nodejs-20_x
    pkgs.prisma-engines
    (pkgs.openssl_1_1.overrideAttrs (old: {
      meta = old.meta // { knownVulnerabilities = []; };
    }))
  ];
  env = {
    LD_LIBRARY_PATH = "${pkgs.openssl_1_1.out}/lib";
    PRISMA_QUERY_ENGINE_LIBRARY = "${pkgs.prisma-engines}/lib/libquery_engine-debian-openssl-1.1.x.so.node";
    PRISMA_MIGRATION_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/migration-engine";
    PRISMA_INTROSPECTION_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/introspection-engine";
    PRISMA_FMT_BINARY = "${pkgs.prisma-engines}/bin/prisma-fmt";
  };
}
