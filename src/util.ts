import {
	stdin,
} from 'process'

export async function readStdin() : Promise<string> {
	let content = ""
	for await (const chunk of stdin) {
		content += chunk;
	}
	return content
}

