abi <abi/4.0>,
include <tunables/global>

# NOTE: the binary path below mirrors the electron-builder deb convention
# /opt/<productName>/<lowercased-productName>. It MUST be re-verified against
# the actual release/ output on Linux after packaging, since the shipped
# executable name can differ depending on how the deb was built.
profile sceneviz /opt/Sceneviz/sceneviz flags=(unconfined) {
  userns,
  include if exists <local/sceneviz>
}
