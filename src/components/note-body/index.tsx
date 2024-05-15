import { Doc } from "@convex/_generated/dataModel";

type NoteBodyProps = {
  note: any;
  users: Doc<"users">[] | any;
  obfuscate: boolean
};

const replaceBody = (body: string) : string => {
  let replacedBody = body;

  const fullExpressionRegex = /@\[([^)]+)\]\(([^)]+)\)/g;
  const nameRegex = /\[([^\]]+)\]/g;
  const searchs = body.match(fullExpressionRegex);

  if (searchs) {
    searchs.forEach((search: string) => {
      const name = nameRegex.exec(search);
      const user = { name: name ? name[1] : "" };

      replacedBody = replacedBody.replace(
        search,
        `<span class="user-mention">@${user.name}</span>`
      );

      nameRegex.lastIndex = 0;
    });
  }

  return replacedBody
}

export default function NoteBody(props: NoteBodyProps) {
  const {
    note: { body },
    obfuscate = false
  } = props;

  if (obfuscate) {
    return <div dangerouslySetInnerHTML={{
      __html: 'c '.repeat(String(body).length / 2)
    }} />;
  }

  return <div dangerouslySetInnerHTML={{ __html: replaceBody(body) }} />;
}
