async function main() {
  console.log("CTX starts with an empty workspace. Create capsules from the web app, extension, MCP server, or GitHub capture.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
