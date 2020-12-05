import React from "react";
import {
  AuthorLabel,
  useCurrentAuthor,
  useCurrentWorkspace,
  useDocument,
  useDocuments,
  usePaths,
} from "react-earthstar";
import { Document, detChoice } from "earthstar";
import "./cozylobby.css";

var currPath = "/lobby/";
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
	  <section id={"choose-your-path"}>
	    <PathList workspace={currentWorkspace} />
	  </section>
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

function PathList({ workspace }: {workspace: string }) {
  let paths = usePaths({contentIsEmpty: false});
  paths = paths.map(function(path) {
	  return path.slice(0,path.indexOf("/", 1)+1)
	})
  paths = Array.from(new Set(paths));
  return (
    <>
      <div id={"preamble"}>
        <em>{"Here you can see some paths that this workspace uses! Click on them to change where you view and send documents. Be careful though, some folders might not be set up to receive raw messages. Make sure you know what you're doing! And be patient, it'll take a bit to grab new documents when you switch. Don't refresh, just wait 30-60 seconds, or longer if it's your first time checking this path after a refresh."}</em>
        <hr />
      </div>
      <div id={"paths"}>
        {paths.map(path => <button className={"path"} onClick={(e) => {
	  currPath = path;
	  var pathEls = document.getElementsByClassName("path");
	  for (var i = 0; i < pathEls.length; i++) {
	    pathEls[i].className = pathEls[i].className.replace(" active", "");
	  }
	  e.currentTarget.className += " active";
        }}>{path}</button>)}
      </div>
    </>
  );
}

function MessageList({ workspace }: { workspace: string }) {
  const messagesRef = React.useRef<HTMLDivElement | null>(null);

  const docs = useDocuments({
    pathPrefix: currPath,
    contentIsEmpty: false,
  });

  // 'Good enough' sorting
  docs.sort((aDoc, bDoc) => (aDoc.timestamp < bDoc.timestamp ? -1 : 1));

  const lastDoc = docs[docs.length - 1];
  const lastDocId = lastDoc?.path ?? "none";

  React.useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [lastDocId, currPath]);

  return (
    <>
      <div id={"preamble"}>
        <em>{"This is where documents will appear. If you don't see any, you might need to connect to a Pub, or turn on syncing."}</em>
        <hr />
      </div>
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
  
  var date = new Date(messageDoc.timestamp / 1000);
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hour = "0" + date.getHours();
  var minute = "0" + date.getMinutes();
  var date_str = day.toString() + "/" + month.toString() + "/" + year.toString() + " " + hour.substr(-2) + ":" + minute.substr(-2);
  const returnThis = (
    <div id={"message"}>
      {name}
      {": "}
      <span title={date_str}>
      	{messageDoc.content}
      </span>
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

  const path = currPath + `~${currentAuthor?.address}/${Date.now()}.txt`;

  const [, setDoc] = useDocument(workspace, path);
  var placehold = "Send a message to " + currPath;
  React.useEffect(() => {
    placehold = "Send a message to " + currPath;
  }, [currPath]);
  if (!currentAuthor) {
    return <div>{"Sign in to send a message."}</div>;
  }
  
  return (
    <form
      id={"posting-input"}
      onSubmit={(e) => {
        e.preventDefault();
	if (messageValue.trim().length === 0) { return; }
        setDoc(
          messageValue.trim()
        );

        setMessageValue("");
      }}
    >
      <input
        placeholder= {placehold}
        
        value={messageValue}
        onChange={(e) => setMessageValue(e.target.value)}
      />
      <button type={"submit"}>{"Send"}</button>
    </form>
  );
}
