import React from "react";
import {
  AuthorLabel,
  useCurrentAuthor,
  useCurrentWorkspace,
  useDocument,
  useDocuments,
} from "react-earthstar";
import { Document, detChoice } from "earthstar";
import "./cozylobby.css";

export default function CozyLobby() {
  const [currentWorkspace] = useCurrentWorkspace();

  return (
    <div id={"cozylobby-app"}>
      {currentWorkspace ? (
        <>
          <header>
            <aside>
              <p>
		Welcome to The Cozy Lobby. This is an Earthstar <b>app</b>. You can use it to view any <b>workspace</b> you know the address of. You might also need to connect to a <b>pub</b> to get the latest <b>documents</b> from that workspace. You can get started by clicking 'Add' in the top bar.
              </p>
            </aside>
          </header>
          <section id={"panel"}>
            <MessageList workspace={currentWorkspace} />
            <MessagePoster workspace={currentWorkspace} />
          </section>
        </>
      ) : (
        <div>
          <p>
            {
              "To enter The Cozy Lobby, you must first join and select a workspace."
            }
          </p>
          <p>
            {
              "If you don't know any yet, find a friend who can give you an invitation code."
            }
          </p>
        </div>
      )}
    </div>
  );
}

function PastMessages({ workspace }: { workspace: string }) {

  return (
    <div id={"preamble"}>
      <em>{"This is where documents will appear. If you don't see any, you might need to connect to a Pub, or turn on syncing."}</em>
      <hr />
    </div>
  );
}

function MessageList({ workspace }: { workspace: string }) {
  const messagesRef = React.useRef<HTMLDivElement | null>(null);

  const docs = useDocuments(workspace, {
    pathPrefix: "/lobby/",
  });

  const lastDoc = docs[docs.length - 1];

  const lastDocId = lastDoc?.contentHash ?? "none";

  React.useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [lastDocId]);

  // 'Good enough' sorting
  docs.sort((aDoc, bDoc) => (aDoc.timestamp < bDoc.timestamp ? -1 : 1));

  return (
    <>
      <PastMessages workspace={workspace} />
      <div ref={messagesRef} id={"author-messages"}>
        {docs.map((doc) => (
          <Message key={doc.path} workspace={workspace} doc={doc} />
        ))}
      </div>
    </>
  );
}

function ActionisedMessage({
  workspace,
  messageDoc,
}: {
  workspace: string;
  messageDoc: Document;
}) {

  const className = detChoice(messageDoc.author, [
    "author-a",
    "author-b",
    "author-c",
    "author-d",
    "author-e",
    "author-f",
  ]);

  const [displayNameDoc] = useDocument(
    workspace,
    `/about/~${messageDoc.author}/displayName.txt`
  );

  const name = (
    <span className={className} title={messageDoc.author}>
      {displayNameDoc ? (
        displayNameDoc.content
      ) : (
        <AuthorLabel address={messageDoc.author} />
      )}
    </span>
  );

  const returnThis = (
    <div id={"message"}>
      {name}
      {": "}
      {messageDoc.content}
    </div>
  );

  return returnThis;
}

function Message({ workspace, doc }: { workspace: string; doc: Document }) {
  return (
    <div>
      <ActionisedMessage workspace={workspace} messageDoc={doc} />
    </div>
  );
}

function MessagePoster({ workspace }: { workspace: string }) {
  const [messageValue, setMessageValue] = React.useState("");
  const [currentAuthor] = useCurrentAuthor();

  const path = `/lobby/~${currentAuthor?.address}/${Date.now()}.txt`;

  const [, setDoc] = useDocument(workspace, path);

  if (!currentAuthor) {
    return <div>{"Sign in to send a message."}</div>;
  }

  return (
    <form
      id={"posting-input"}
      onSubmit={(e) => {
        e.preventDefault();

        setDoc(
          messageValue
        );

        setMessageValue("");
      }}
    >
      <input
        placeholder={
          "Send a message!"
        }
        value={messageValue}
        onChange={(e) => setMessageValue(e.target.value)}
      />
      <button type={"submit"}>{"Send"}</button>
    </form>
  );
}
