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

interface IData {
  setPath: Function;
  workspace: string;
}

export default function CozyLobby() {
  const [currentWorkspace] = useCurrentWorkspace();
  const [currPath, setPath] = React.useState("/lobby/");

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
          <div id={"left-panel"}>
	    <section id={"choose-your-path"}>
	      <PathList setPath={setPath} workspace={currentWorkspace} />
	    </section>
	    <section id={"new-path"}>
	      <NewPath setPath={setPath} workspace={currentWorkspace}/>
	    </section>
	  </div>
          <section id={"panel"}>
            <MessageList path={currPath} workspace={currentWorkspace} />
            <MessagePoster workspace={currentWorkspace} mp_path={currPath} />
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

function PathList({setPath, workspace}: IData) {
  let paths = usePaths({contentIsEmpty: false});
  paths = paths.map(function(path) {
  	  path = path.slice(0,path.indexOf("@"));
	  path = path.slice(0,path.indexOf("~"));
	  return path.slice(0,path.lastIndexOf("/")+1);
	})
  paths = Array.from(new Set(paths));
  for (var i=0;i<paths.length;i++) {
    if (paths[i].substring(0,6) !== "/lobby" && paths[i].substring(0,5) !== "/chat") {
      paths.splice(i,1);
      i--;
    }
  }
  return (
    <>
      <div id={"preamble"}>
        <em>{"Here you can see some paths that this workspace uses for chatting! Click on them to change where you view and send documents."}</em>
        <hr />
      </div>
      <div id={"paths"}>
        {paths.map(path => <button className={"path"} onClick={(e) => {
	  setPath(path);
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

function NewPath({setPath, workspace}: IData) {
  const [pathValue, setPathValue] = React.useState("");
  const [currentAuthor] = useCurrentAuthor();
  if (!currentAuthor) {
    return <div>{"Sign in to make a new path."}</div>;
  }
  var placehold="name your new path, then send a message to create it";
  return (
    <form
      id={"new-path-input"}
      onSubmit={(e) => {
        e.preventDefault();
	if (pathValue.trim().length === 0) { return; }
	const path = `/chat-cl-v1/` + pathValue + `/`;
	setPath(path);
        setPathValue("");
      }}
    >
      <input
        placeholder= {placehold}
        value={pathValue}
        onChange={(e) => setPathValue(e.target.value)}
      />
      <button type={"submit"}>{"Create"}</button>
    </form>
  );
}

function MessageList({path, workspace}: {path: string, workspace: string }) {
  const messagesRef = React.useRef<HTMLDivElement | null>(null);

  const docs = useDocuments({
    pathPrefix: path,
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
  }, [lastDocId, path]);

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

function Message({ workspace, doc}: { workspace: string; doc: Document}) {
  return (
    <div>
      <ActionisedMessage workspace={workspace} messageDoc={doc} />
    </div>
  );
}

function MessagePoster({ workspace, mp_path }: { workspace: string; mp_path: string}) {
  const [messageValue, setMessageValue] = React.useState("");
  const [currentAuthor] = useCurrentAuthor();

  const path = mp_path + `~${currentAuthor?.address}/${Date.now()}.txt`;

  const [, setDoc] = useDocument(path, workspace);
  var placehold = "Send a message to " + mp_path;
  if (!currentAuthor) {
    return <div>{"Sign in to send a message."}</div>;
  }
  
  return (
    <form
      id={"posting-input"}
      onSubmit={(e) => {
        e.preventDefault();
	if (messageValue.trim().length === 0) { return; }
	setDoc(messageValue.trim());

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
