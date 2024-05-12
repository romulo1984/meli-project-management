import { Doc } from "@convex/_generated/dataModel";

type NoteBodyProps = {
  note: any;
  users: Doc<"users">[] | any;
};

export default function NoteBody(props: NoteBodyProps) {
  const {
    note: { body },
    users,
  } = props;

  let replacedBody = body;

  const fullExpressionRegex = /@\[([^)]+)\]\(([^)]+)\)/g;
  const nameRegex = /\[([^\]]+)\]/g;
  const searchs = body.match(fullExpressionRegex);

  if (searchs) {
    searchs.forEach((search: string) => {
      const name = nameRegex.exec(search);
      const user = { name: name ? name[1] : "" };

      replacedBody = replacedBody.replaceAll(
        search,
        `<span class="user-mention">@${user.name}</span>`
      );
    });
  }

  return <div dangerouslySetInnerHTML={{ __html: replacedBody }} />;
}
