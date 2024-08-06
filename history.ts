const homeDir = Deno.env.get("HOME");

const historyFilePath = `${homeDir}/.radio_history.txt`;

export async function readHistoryFile(): Promise<Set<number>> {
  try {
    const file = await Deno.readTextFile(historyFilePath);
    return new Set(file.trim().split("\n").map(Number));
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return new Set();
    }
    throw error;
  }
}

export async function addIdToHistoryFile(id: number) {
  await Deno.writeTextFile(historyFilePath, `${id}\n`, {
    append: true,
  });
}
